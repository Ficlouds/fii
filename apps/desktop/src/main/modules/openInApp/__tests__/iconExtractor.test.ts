import { execFile, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { access, mkdtemp, writeFile } from 'node:fs/promises';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetForTest, extractAllIcons, extractAppIcon } from '../iconExtractor';

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  mkdtemp: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
  spawn: vi.fn(),
}));

const mockedAccess = vi.mocked(access);
const mockedMkdtemp = vi.mocked(mkdtemp);
const mockedWriteFile = vi.mocked(writeFile);
const mockedExecFile = vi.mocked(execFile) as unknown as ReturnType<typeof vi.fn>;
const mockedSpawn = vi.mocked(spawn);

const respondWhich = (success: boolean) => {
  mockedExecFile.mockImplementationOnce(
    (_file: string, _args: string[], _opts: unknown, cb: any) => {
      const callback = typeof _opts === 'function' ? _opts : cb;
      if (success) {
        callback(null, '/usr/bin/osascript\n', '');
      } else {
        callback(new Error('which: osascript not found'), '', '');
      }
      return undefined as any;
    },
  );
};

interface FakeChildOptions {
  code?: number | null;
  errorBeforeClose?: Error;
  stderr?: string;
  stdout?: string;
}

const makeChild = (opts: FakeChildOptions) => {
  const emitter = new EventEmitter() as EventEmitter & {
    stderr: EventEmitter;
    stdout: EventEmitter;
  };
  emitter.stdout = new EventEmitter();
  emitter.stderr = new EventEmitter();
  // Fire async so the runner attaches listeners first.
  setImmediate(() => {
    if (opts.stdout) emitter.stdout.emit('data', Buffer.from(opts.stdout));
    if (opts.stderr) emitter.stderr.emit('data', Buffer.from(opts.stderr));
    if (opts.errorBeforeClose) {
      emitter.emit('error', opts.errorBeforeClose);
      return;
    }
    emitter.emit('close', opts.code ?? 0);
  });
  return emitter;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAccess.mockReset();
  mockedSpawn.mockReset();
  mockedMkdtemp.mockReset();
  mockedWriteFile.mockReset();
  mockedExecFile.mockReset();
  __resetForTest();
});

describe('extractAppIcon', () => {
  it('returns a data URL when osascript succeeds on darwin', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedSpawn.mockReturnValueOnce(
      makeChild({ code: 0, stdout: 'data:image/png;base64,AAAAAAAAAAAAAA\n' }) as any,
    );

    const result = await extractAppIcon('vscode', 'darwin');

    expect(result).toBe('data:image/png;base64,AAAAAAAAAAAAAA');
    expect(mockedSpawn).toHaveBeenCalledWith(
      'osascript',
      [
        '-l',
        'JavaScript',
        '/tmp/lobehub-openinapp-test/extractIcon.js',
        '/Applications/Visual Studio Code.app',
        '64',
      ],
      expect.objectContaining({ timeout: 5000 }),
    );
  });

  it('falls back to the next path when the first bundle does not exist', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    // Terminal has two candidate paths; first fails, second succeeds.
    mockedAccess.mockRejectedValueOnce(new Error('missing'));
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedSpawn.mockReturnValueOnce(
      makeChild({ code: 0, stdout: 'data:image/png;base64,TERM_ICON_DATA\n' }) as any,
    );

    const result = await extractAppIcon('terminal', 'darwin');

    expect(result).toBe('data:image/png;base64,TERM_ICON_DATA');
  });

  it('returns undefined when no bundle path exists', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    mockedAccess.mockRejectedValue(new Error('missing'));

    const result = await extractAppIcon('vscode', 'darwin');

    expect(result).toBeUndefined();
    expect(mockedSpawn).not.toHaveBeenCalled();
  });

  it('returns undefined when osascript exits non-zero', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedSpawn.mockReturnValueOnce(makeChild({ code: 1, stderr: 'osascript error\n' }) as any);

    const result = await extractAppIcon('vscode', 'darwin');

    expect(result).toBeUndefined();
  });

  it('returns undefined when osascript stdout is not a data URL', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedSpawn.mockReturnValueOnce(makeChild({ code: 0, stdout: '\n' }) as any);

    const result = await extractAppIcon('vscode', 'darwin');

    expect(result).toBeUndefined();
  });

  it('returns undefined when registry has no darwin entry for the app', async () => {
    respondWhich(true);
    const result = await extractAppIcon('explorer', 'darwin');
    expect(result).toBeUndefined();
    expect(mockedAccess).not.toHaveBeenCalled();
    expect(mockedSpawn).not.toHaveBeenCalled();
  });

  it('returns undefined on win32 (extractor is macOS-only)', async () => {
    const result = await extractAppIcon('vscode', 'win32');
    expect(result).toBeUndefined();
    expect(mockedExecFile).not.toHaveBeenCalled();
    expect(mockedSpawn).not.toHaveBeenCalled();
  });

  it('returns undefined on linux (extractor is macOS-only)', async () => {
    const result = await extractAppIcon('vscode', 'linux');
    expect(result).toBeUndefined();
    expect(mockedExecFile).not.toHaveBeenCalled();
    expect(mockedSpawn).not.toHaveBeenCalled();
  });
});

describe('extractAllIcons', () => {
  it('returns a map of only AppIds with successfully extracted icons', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    mockedAccess.mockImplementation(async (p: any) => {
      if (typeof p === 'string' && p.includes('Cursor.app')) throw new Error('missing');
    });
    mockedSpawn.mockImplementation(
      (_cmd: string, args: any) =>
        makeChild({
          code: 0,
          stdout: `data:image/png;base64,${(args as string[])[3]}\n`,
        }) as any,
    );

    const map = await extractAllIcons(['vscode', 'cursor', 'xcode'], 'darwin');

    expect(map.has('vscode')).toBe(true);
    expect(map.has('xcode')).toBe(true);
    expect(map.has('cursor')).toBe(false);
  });

  it('returns empty map when input list is empty', async () => {
    const map = await extractAllIcons([], 'darwin');
    expect(map.size).toBe(0);
  });

  it('does not throw when extraction errors', async () => {
    respondWhich(true);
    mockedMkdtemp.mockResolvedValueOnce('/tmp/lobehub-openinapp-test');
    mockedWriteFile.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValue(undefined);
    mockedSpawn.mockImplementation(() => makeChild({ errorBeforeClose: new Error('boom') }) as any);

    const map = await extractAllIcons(['vscode'], 'darwin');

    expect(map.size).toBe(0);
  });
});
