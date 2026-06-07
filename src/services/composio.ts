import { Composio } from 'composio-core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

export const getComposioAuthUrl = async (appName: string, userId: string, redirectUrl: string) => {
  try {
    const connectionRequest = await composio.connectedAccounts.link({
      appName,
      entityId: userId,
      redirectUri: redirectUrl,
    });
    return connectionRequest.redirectUrl;
  } catch (e) {
    console.error('Composio auth URL error:', e);
    throw e;
  }
};

export const getComposioConnections = async (userId: string) => {
  try {
    const connections = await composio.connectedAccounts.list({ entityId: userId });
    return connections.items || [];
  } catch (e) {
    console.error('Composio connections error:', e);
    return [];
  }
};

export const disconnectComposioApp = async (connectionId: string) => {
  try {
    await composio.connectedAccounts.delete({ connectedAccountId: connectionId });
  } catch (e) {
    console.error('Composio disconnect error:', e);
    throw e;
  }
};
