import { execFile, spawn } from 'node:child_process';
import { access, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import type { OpenInAppId } from '@lobechat/electron-client-ipc';

import { createLogger } from '@/utils/logger';

import { APP_REGISTRY } from './registry';

const logger = createLogger('modules:openInApp:iconExtractor');

const execFileAsync = promisify(execFile);

/** Render dimensions for the extracted PNG. 64 keeps the payload tiny while
 *  staying crisp at the renderer's 16-20 px display size on retina. */
const ICON_SIZE = 64;
/** Each JXA invocation is bounded to avoid pathological hangs. macOS's
 *  IconServices generally responds within tens of ms. */
const OSASCRIPT_TIMEOUT_MS = 5000;

/**
 * JXA (JavaScript for Automation) program that extracts a macOS app icon as a
 * base64 PNG data URL. Runs via `osascript -l JavaScript` in an isolated
 * child process so Electron itself cannot crash on `app.getFileIcon`
 * regressions (Electron 41 + macOS 26 trips EXC_BREAKPOINT inside
 * NSImage / IconServices when invoked from the Electron main process).
 *
 * osascript ships on every macOS install — no Xcode / Swift toolchain
 * dependency, no electron-builder bundling required.
 *
 * argv: <bundlePath> <size>
 * stdout: `data:image/png;base64,…` on success; empty / non-conforming on
 * failure (caller treats anything other than a valid data URL as "no icon").
 */
const JXA_SOURCE = `function run(argv) {
  ObjC.import('AppKit');
  if (argv.length < 1) return '';
  var bundlePath = argv[0];
  var size = parseInt(argv[1], 10) || 64;

  var fm = $.NSFileManager.defaultManager;
  if (!fm.fileExistsAtPath(bundlePath)) return '';

  var workspace = $.NSWorkspace.sharedWorkspace;
  var icon = workspace.iconForFile(bundlePath);
  if (!icon) return '';
  icon.size = $.NSMakeSize(size, size);

  // Re-draw into a fresh canvas at the target size so we get the resolved
  // representation rather than the multi-rep NSImage's TIFF (which may be
  // larger than needed).
  var target = $.NSImage.alloc.initWithSize($.NSMakeSize(size, size));
  target.lockFocus();
  icon.drawInRectFromRectOperationFraction(
    $.NSMakeRect(0, 0, size, size),
    $.NSMakeRect(0, 0, 0, 0),
    1, // NSCompositingOperationCopy
    1.0
  );
  target.unlockFocus();

  var tiff = target.tiffRepresentation;
  if (!tiff) return '';
  var rep = $.NSBitmapImageRep.imageRepWithData(tiff);
  if (!rep) return '';
  var png = rep.representationUsingTypeProperties(4 /* NSBitmapImageFileTypePNG */, $());
  if (!png) return '';
  var base64 = png.base64EncodedStringWithOptions(0);
  return 'data:image/png;base64,' + ObjC.unwrap(base64);
}
`;

let scriptPathPromise: Promise<string | undefined> | undefined;

/**
 * Write the JXA source to a tmp file once per process and reuse it for every
 * extraction call. Returns undefined if the source can't be written (rare).
 */
const ensureScript = async (): Promise<string | undefined> => {
  if (scriptPathPromise) return scriptPathPromise;
  scriptPathPromise = (async () => {
    try {
      const dir = await mkdtemp(path.join(tmpdir(), 'lobehub-openinapp-'));
      const filePath = path.join(dir, 'extractIcon.js');
      await writeFile(filePath, JXA_SOURCE, 'utf8');
      logger.debug(`prepared JXA script at ${filePath}`);
      return filePath;
    } catch (error) {
      logger.debug(`failed to prepare JXA script: ${(error as Error).message}`);
      return undefined;
    }
  })();
  return scriptPathPromise;
};

const runOsascript = (scriptPath: string, bundlePath: string): Promise<string | undefined> => {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (value: string | undefined) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const proc = spawn(
      'osascript',
      ['-l', 'JavaScript', scriptPath, bundlePath, String(ICON_SIZE)],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: OSASCRIPT_TIMEOUT_MS,
      },
    );
    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('error', (error) => {
      logger.debug(`osascript spawn failed for ${bundlePath}: ${error.message}`);
      finish(undefined);
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        logger.debug(
          `osascript exited code=${code} for ${bundlePath}: ${stderr.trim().slice(0, 200)}`,
        );
        finish(undefined);
        return;
      }
      const trimmed = stdout.trim();
      const prefix = 'data:image/png;base64,';
      if (trimmed.startsWith(prefix) && trimmed.length > prefix.length) {
        finish(trimmed);
        return;
      }
      logger.debug(`osascript produced unexpected stdout for ${bundlePath}`);
      finish(undefined);
    });
  });
};

let osascriptAvailablePromise: Promise<boolean> | undefined;

/**
 * Confirm `osascript` is on PATH. It ships with every macOS install so this is
 * effectively a sanity check; cached for the process lifetime.
 */
const isOsascriptAvailable = (): Promise<boolean> => {
  if (osascriptAvailablePromise) return osascriptAvailablePromise;
  osascriptAvailablePromise = (async () => {
    try {
      await execFileAsync('/usr/bin/which', ['osascript']);
      return true;
    } catch {
      logger.debug('osascript not found on PATH; falling back to renderer icons');
      return false;
    }
  })();
  return osascriptAvailablePromise;
};

const resolveDarwinBundlePath = async (id: OpenInAppId): Promise<string | undefined> => {
  const strategy = APP_REGISTRY[id]?.detect.darwin;
  if (!strategy || strategy.type !== 'appBundle') return undefined;
  for (const candidate of strategy.paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  return undefined;
};

/**
 * Extract the real macOS app icon for the given AppId via a JXA child process
 * that calls `NSWorkspace.shared.icon(forFile:)`. macOS only (Windows / Linux
 * fall back to the renderer's lucide icon table).
 */
export const extractAppIcon = async (
  id: OpenInAppId,
  platform: NodeJS.Platform = process.platform,
): Promise<string | undefined> => {
  if (platform !== 'darwin') return undefined;
  try {
    if (!(await isOsascriptAvailable())) return undefined;
    const bundlePath = await resolveDarwinBundlePath(id);
    if (!bundlePath) return undefined;
    const scriptPath = await ensureScript();
    if (!scriptPath) return undefined;
    return await runOsascript(scriptPath, bundlePath);
  } catch (error) {
    logger.debug(`extractAppIcon error for ${id}: ${(error as Error).message}`);
    return undefined;
  }
};

/**
 * Resolve icons for a list of installed AppIds. Sequential — keeps spawn
 * pressure low and matches IconServices' single-thread behavior.
 */
export const extractAllIcons = async (
  installedIds: OpenInAppId[],
  platform: NodeJS.Platform = process.platform,
): Promise<Map<OpenInAppId, string>> => {
  const map = new Map<OpenInAppId, string>();
  for (const id of installedIds) {
    try {
      const icon = await extractAppIcon(id, platform);
      if (icon) map.set(id, icon);
    } catch (error) {
      logger.debug(`extractAllIcons: skipping ${id} after error: ${(error as Error).message}`);
    }
  }
  return map;
};

/**
 * Test-only: reset the module-level caches so each test starts fresh.
 */
export const __resetForTest = () => {
  scriptPathPromise = undefined;
  osascriptAvailablePromise = undefined;
};
