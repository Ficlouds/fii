import { type NextRequest } from 'next/server';

const REDIRECT_BASE = 'http://127.0.0.1:3010/api/oauth/callback';

interface ProviderTokenConfig {
  basicAuth?: boolean;
  grantType?: boolean;
  headers?: Record<string, string>;
  redirectUri?: boolean;
  tokenUrl: string;
}

const PROVIDER_TOKEN_CONFIG: Record<string, ProviderTokenConfig> = {
  asana: { grantType: true, redirectUri: true, tokenUrl: 'https://app.asana.com/-/oauth_token' },
  atlassian: { grantType: true, redirectUri: true, tokenUrl: 'https://auth.atlassian.com/oauth/token' },
  box: { grantType: true, tokenUrl: 'https://api.box.com/oauth2/token' },
  canva: { grantType: true, redirectUri: true, tokenUrl: 'https://api.canva.com/rest/v1/oauth/token' },
  dropbox: { grantType: true, redirectUri: true, tokenUrl: 'https://api.dropboxapi.com/oauth2/token' },
  figma: { grantType: true, redirectUri: true, tokenUrl: 'https://www.figma.com/api/oauth/token' },
  github: {
    headers: { Accept: 'application/json' },
    redirectUri: true,
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
  hubspot: { grantType: true, redirectUri: true, tokenUrl: 'https://api.hubapi.com/oauth/v1/token' },
  linear: { grantType: true, redirectUri: true, tokenUrl: 'https://api.linear.app/oauth/token' },
  notion: { basicAuth: true, grantType: true, redirectUri: true, tokenUrl: 'https://api.notion.com/v1/oauth/token' },
  paypal: {
    basicAuth: true,
    grantType: true,
    redirectUri: true,
    tokenUrl: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
  },
  shopify: { grantType: true, redirectUri: true, tokenUrl: 'https://accounts.shopify.com/oauth/token' },
  slack: { redirectUri: true, tokenUrl: 'https://slack.com/api/oauth.v2.access' },
};

const exchangeToken = async (provider: string, code: string): Promise<boolean> => {
  const config = PROVIDER_TOKEN_CONFIG[provider];
  if (!config) return false;

  const envPrefix = `AUTH_${provider.toUpperCase()}`;
  const clientId = process.env[`${envPrefix}_ID`];
  const clientSecret = process.env[`${envPrefix}_SECRET`];
  if (!clientId || !clientSecret) return false;

  const body = new URLSearchParams();
  body.set('code', code);
  if (config.grantType) body.set('grant_type', 'authorization_code');
  if (config.redirectUri) body.set('redirect_uri', `${REDIRECT_BASE}/${provider}`);
  if (!config.basicAuth) {
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...config.headers,
  };
  if (config.basicAuth) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  }

  try {
    const res = await fetch(config.tokenUrl, { body: body.toString(), headers, method: 'POST' });
    if (!res.ok) return false;

    const data = await res.json();
    if (provider === 'slack') return data?.ok === true;
    return Boolean(data?.access_token);
  } catch {
    return false;
  }
};

const successHtml = (provider: string) => `<!DOCTYPE html>
<html>
<head>
  <title>Connected to Fi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f0f0e; color: white; flex-direction: column; gap: 12px; }
    .check { width: 56px; height: 56px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    h2 { font-size: 20px; font-weight: 500; }
    p { font-size: 13px; opacity: 0.5; }
  </style>
</head>
<body>
  <div class="check">✓</div>
  <h2>Connected successfully</h2>
  <p>Closing this window...</p>
  <script>
    try {
      localStorage.setItem('fi:oauth-success', JSON.stringify({ provider: '${provider}', timestamp: Date.now() }));
    } catch(e) {}
    setTimeout(function() {
      window.close();
      setTimeout(function() {
        window.location.href = '/connect?oauth_success=${provider}';
      }, 500);
    }, 1500);
  </script>
</body>
</html>`;

const errorHtml = (provider: string) => `<!DOCTYPE html>
<html>
<head>
  <title>Connection Failed</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f0f0e; color: white; flex-direction: column; gap: 12px; }
    .x { width: 56px; height: 56px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    h2 { font-size: 20px; font-weight: 500; }
    p { font-size: 13px; opacity: 0.5; }
    button { margin-top: 8px; padding: 8px 24px; background: white; color: black; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="x">✗</div>
  <h2>Connection failed</h2>
  <p>Please close this window and try again.</p>
  <button onclick="window.close()">Close</button>
  <script>
    try {
      localStorage.setItem('fi:oauth-failed', JSON.stringify({ provider: '${provider}', timestamp: Date.now() }));
    } catch(e) {}
  </script>
</body>
</html>`;

const htmlResponse = (html: string) =>
  new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return htmlResponse(errorHtml(provider));
  }

  const success = await exchangeToken(provider, code);

  return htmlResponse(success ? successHtml(provider) : errorHtml(provider));
}
