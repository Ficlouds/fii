const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk';
const COMPOSIO_BASE = 'https://backend.composio.dev';

// Step 1: Create or get auth config for an app
export const getOrCreateAuthConfig = async (slug: string): Promise<string> => {
  // First check if auth config already exists for this specific toolkit
  const listRes = await fetch(`${COMPOSIO_BASE}/api/v3/auth_configs?toolkit=${slug}`, {
    headers: { 'x-api-key': COMPOSIO_API_KEY },
  });
  const listData = await listRes.json();
  // Filter to only return config that matches this exact toolkit slug
  const matching = (listData.items || []).filter((item: any) => item.toolkit?.slug === slug);
  if (matching.length > 0) {
    return matching[0].id;
  }
  // Create new auth config
  const createRes = await fetch(`${COMPOSIO_BASE}/api/v3/auth_configs`, {
    body: JSON.stringify({ auth_scheme: 'OAUTH2', is_composio_managed: true, toolkit: { slug } }),
    headers: { 'x-api-key': COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const createData = await createRes.json();
  if (createData.auth_config?.id) return createData.auth_config.id;
  // Try API_KEY scheme if OAUTH2 fails
  const retryRes = await fetch(`${COMPOSIO_BASE}/api/v3/auth_configs`, {
    body: JSON.stringify({ auth_scheme: 'API_KEY', is_composio_managed: true, toolkit: { slug } }),
    headers: { 'x-api-key': COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const retryData = await retryRes.json();
  if (retryData.auth_config?.id) return retryData.auth_config.id;
  throw new Error(`Cannot create auth config for ${slug}`);
};

// Step 2: Get OAuth URL for user to connect
export const getComposioAuthUrl = async (appSlug: string, userId: string): Promise<string> => {
  const authConfigId = await getOrCreateAuthConfig(appSlug);
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3010'}/connect-success?oauth_success=${appSlug}`;
  const res = await fetch(`${COMPOSIO_BASE}/api/v3/connected_accounts/link`, {
    body: JSON.stringify({ auth_config_id: authConfigId, redirect_url: redirectUrl, user_id: userId }),
    headers: { 'x-api-key': COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to get auth URL');
  return data.redirect_url;
};

// Step 3: Get all connected apps for a user
export const getComposioConnections = async (userId: string) => {
  const res = await fetch(`${COMPOSIO_BASE}/api/v3/connected_accounts?user_id=${userId}&limit=100`, {
    headers: { 'x-api-key': COMPOSIO_API_KEY },
  });
  const data = await res.json();
  return data.items || [];
};

// Step 4: Disconnect an app
export const disconnectComposioApp = async (connectionId: string) => {
  await fetch(`${COMPOSIO_BASE}/api/v3/connected_accounts/${connectionId}`, {
    headers: { 'x-api-key': COMPOSIO_API_KEY },
    method: 'DELETE',
  });
};

// Step 5: Get token for a specific app (for AI and n8n to use)
export const getComposioToken = async (userId: string, appSlug: string) => {
  const res = await fetch(
    `${COMPOSIO_BASE}/api/v3/connected_accounts?user_id=${userId}&toolkit=${appSlug}&status=ACTIVE`,
    { headers: { 'x-api-key': COMPOSIO_API_KEY } },
  );
  const data = await res.json();
  if (!data.items || data.items.length === 0) throw new Error(`No active connection for ${appSlug}`);
  return data.items[0];
};
