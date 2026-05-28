import { AUTH_REQUIRED_HEADER } from '@lobechat/desktop-bridge';
import { BrowserWindow, type Session, session as electronSession } from 'electron';

import { isDev } from '@/const/env';
import { isBackendPath } from '@/const/protocol';
import { appendVercelCookie } from '@/utils/http-headers';
import { createLogger } from '@/utils/logger';
import { netFetch } from '@/utils/net-fetch';

import type { RendererRequestInterceptor } from './RendererProtocolManager';

interface BackendProxyContext {
  getAccessToken: () => Promise<string | undefined | null>;
  rewriteUrl: (rawUrl: string) => Promise<string | null>;
  source?: string;
}

interface BackendProxyProtocolManagerOptions extends BackendProxyContext {
  scheme: string;
}

interface BackendProxyProtocolManagerRemoteBaseOptions {
  getAccessToken: () => Promise<string | undefined | null>;
  getRemoteBaseUrl: () => Promise<string | undefined | null>;
  scheme: string;
  source?: string;
}

/**
 * Manage `lobe-backend://` (or any custom scheme) transparent proxy handler registration.
 * Keeps per-session contexts so the proxy logic can be reused from a non-`lobe-backend://`
 * entry point — e.g. the `app://` handler diverting backend-prefixed paths in production.
 */
export class BackendProxyProtocolManager {
  private readonly contexts = new WeakMap<Session, BackendProxyContext>();
  private readonly handledSessions = new WeakSet<Session>();
  private readonly logger = createLogger('core:BackendProxyProtocolManager');

  private authRequiredDebounceTimer: NodeJS.Timeout | null = null;
  private static readonly AUTH_REQUIRED_DEBOUNCE_MS = 1000;

  private notifyAuthorizationRequired() {
    // Trailing-edge debounce: coalesce rapid 401 bursts and fire AFTER the burst settles.
    // This ensures the IPC event is sent after the renderer has had time to mount listeners.
    if (this.authRequiredDebounceTimer) {
      clearTimeout(this.authRequiredDebounceTimer);
    }

    this.authRequiredDebounceTimer = setTimeout(() => {
      this.authRequiredDebounceTimer = null;

      const allWindows = BrowserWindow.getAllWindows();
      for (const win of allWindows) {
        if (!win.isDestroyed()) {
          win.webContents.send('authorizationRequired');
        }
      }
    }, BackendProxyProtocolManager.AUTH_REQUIRED_DEBOUNCE_MS);
  }

  registerWithRemoteBaseUrl(
    session: Session,
    options: BackendProxyProtocolManagerRemoteBaseOptions,
  ) {
    let lastRemoteBaseUrl: string | undefined;

    const rewriteUrl = async (rawUrl: string) => {
      lastRemoteBaseUrl = undefined;
      try {
        const requestUrl = new URL(rawUrl);

        const remoteBaseUrl = await options.getRemoteBaseUrl();
        if (!remoteBaseUrl) return null;
        lastRemoteBaseUrl = remoteBaseUrl;

        const remoteBase = new URL(remoteBaseUrl);
        if (requestUrl.origin === remoteBase.origin) return null;

        const rewrittenUrl = new URL(
          requestUrl.pathname + requestUrl.search,
          remoteBase,
        ).toString();
        this.logger.debug(
          `${options.source ? `[${options.source}] ` : ''}BackendProxy rewrite ${rawUrl} -> ${rewrittenUrl}`,
        );
        return rewrittenUrl;
      } catch (error) {
        this.logger.error(
          `${options.source ? `[${options.source}] ` : ''}BackendProxy rewriteUrl error (rawUrl=${rawUrl}, remoteBaseUrl=${lastRemoteBaseUrl})`,
          error,
        );
        return null;
      }
    };

    this.register(session, {
      getAccessToken: options.getAccessToken,
      rewriteUrl,
      scheme: options.scheme,
      source: options.source,
    });
  }

  register(session: Session, options: BackendProxyProtocolManagerOptions) {
    if (!session) return;

    const { scheme, ...context } = options;
    this.contexts.set(session, context);

    if (this.handledSessions.has(session)) return;

    const logPrefix = options.source ? `[${options.source}] BackendProxy` : '[BackendProxy]';

    session.protocol.handle(scheme, (request) => this.proxy(request, session));

    this.logger.debug(`${logPrefix} protocol handler registered for ${scheme}`);
    this.handledSessions.add(session);
  }

  /**
   * Build an `app://` request interceptor that diverts backend-prefixed paths
   * (trpc / webapi / api/auth / market) through `proxy()` against the default
   * session. Suitable for plugging into `RendererProtocolManager.addRequestInterceptor`
   * so the renderer protocol manager doesn't need to know what "backend" means.
   *
   * Returns `null` for non-backend paths (lets the file pipeline run). Returns
   * a 502 if the backend context isn't wired up yet — for backend prefixes we
   * must never fall through to the SPA HTML fallback.
   */
  createAppRequestInterceptor(): RendererRequestInterceptor {
    return async (request) => {
      const url = new URL(request.url);
      if (!isBackendPath(url.pathname)) return null;

      const session = electronSession.defaultSession;
      if (!session) return new Response('Backend Proxy Unavailable', { status: 502 });

      const proxied = await this.proxy(request, session);
      return proxied ?? new Response('Backend Proxy Unavailable', { status: 502 });
    };
  }

  /**
   * Proxy a renderer-originated request through the remote LobeHub backend.
   * Returns `null` if the session has no proxy context registered yet (caller decides
   * how to fall back). Throws on upstream fetch failure to mirror the original
   * `protocol.handle` semantics.
   */
  async proxy(request: Request, session: Session): Promise<Response | null> {
    const context = this.contexts.get(session);
    if (!context) return null;

    const logPrefix = context.source ? `[${context.source}] BackendProxy` : '[BackendProxy]';

    const rewrittenUrl = await context.rewriteUrl(request.url);
    if (!rewrittenUrl) return null;

    const headers = new Headers(request.headers);
    const token = await context.getAccessToken();
    if (token) {
      headers.set('Oidc-Auth', token);
    }
    appendVercelCookie(headers);

    const requestInit: RequestInit & { duplex?: 'half' } = {
      headers,
      method: request.method,
    };

    // Only forward body for non-GET/HEAD requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = request.body ?? undefined;
      if (body) {
        requestInit.body = body;
        // Node.js (undici) requires `duplex` when sending a streaming body
        requestInit.duplex = 'half';
      }
    }

    let upstreamResponse: Response;
    try {
      upstreamResponse = await netFetch(rewrittenUrl, requestInit);
    } catch (error) {
      this.logger.error(`${logPrefix} upstream fetch failed: ${rewrittenUrl}`, error);
      throw error;
    }

    const responseHeaders = new Headers(upstreamResponse.headers);
    const allowOrigin = request.headers.get('Origin') || undefined;

    if (allowOrigin) {
      responseHeaders.set('Access-Control-Allow-Origin', allowOrigin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    }

    if (isDev) {
      responseHeaders.set('x-dev-oidc-auth', token);
    }

    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('X-Src-Url', rewrittenUrl);

    // Re-auth prompt: rely on X-Auth-Required (set by tRPC responseMeta for UNAUTHORIZED).
    // Batched tRPC responses can use HTTP 207 when calls mix success (200) and UNAUTHORIZED (401);
    // checking only status === 401 misses that case and the login modal never opens.
    // Other failures keep 401 without this header (e.g., invalid API keys) and must not notify here.
    const authRequired = upstreamResponse.headers.get(AUTH_REQUIRED_HEADER) === 'true';
    if (authRequired) {
      this.notifyAuthorizationRequired();
    }

    return new Response(upstreamResponse.body, {
      headers: responseHeaders,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });
  }
}

export const backendProxyProtocolManager = new BackendProxyProtocolManager();
