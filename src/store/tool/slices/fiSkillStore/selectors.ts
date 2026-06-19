import { type ToolStoreState } from '../../initialState';
import { type FiSkillServer } from './types';
import { FiSkillStatus } from './types';

/**
 * Fi Skill Store Selectors
 */
export const fiSkillStoreSelectors = {
  /**
   * Get all Fi Skill server identifiers as a set
   */
  getAllServerIdentifiers: (s: ToolStoreState): Set<string> => {
    const servers = s.fiSkillServers || [];
    return new Set(servers.map((server) => server.identifier));
  },

  /**
   * Get all available tools from all connected servers
   */
  getAllTools: (s: ToolStoreState) => {
    const connectedServers = fiSkillStoreSelectors.getConnectedServers(s);
    return connectedServers.flatMap((server) =>
      (server.tools || []).map((tool) => ({
        ...tool,
        provider: server.identifier,
      })),
    );
  },

  /**
   * Get all connected servers
   */
  getConnectedServers: (s: ToolStoreState): FiSkillServer[] =>
    (s.fiSkillServers || []).filter(
      (server) => server.status === FiSkillStatus.CONNECTED,
    ),

  /**
   * Get server by identifier
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  getServerByIdentifier: (identifier: string) => (s: ToolStoreState) =>
    s.fiSkillServers?.find((server) => server.identifier === identifier),

  /**
   * Get all Fi Skill servers
   */
  getServers: (s: ToolStoreState): FiSkillServer[] => s.fiSkillServers || [],

  /**
   * Check if the given identifier is a Fi Skill server
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isFiSkillServer:
    (identifier: string) =>
    (s: ToolStoreState): boolean => {
      const servers = s.fiSkillServers || [];
      return servers.some((server) => server.identifier === identifier);
    },

  /**
   * Check if a server is loading
   * @param identifier - Provider identifier (e.g., 'linear')
   */
  isServerLoading: (identifier: string) => (s: ToolStoreState) =>
    s.fiSkillLoadingIds?.has(identifier) || false,

  /**
   * Check if a tool is currently executing
   */
  isToolExecuting: (provider: string, toolName: string) => (s: ToolStoreState) => {
    const toolId = `${provider}:${toolName}`;
    return s.fiSkillExecutingToolIds?.has(toolId) || false;
  },

  /**
   * Get all Fi Skill tools as FiTool format for agent use
   * Converts Fi Skill tools into the format expected by ToolNameResolver
   */
  fiSkillAsLobeTools: (s: ToolStoreState) => {
    const servers = s.fiSkillServers || [];
    const tools: any[] = [];

    for (const server of servers) {
      if (!server.tools || server.status !== FiSkillStatus.CONNECTED) continue;

      const apis = server.tools.map((tool) => ({
        description: tool.description || '',
        name: tool.name,
        parameters: tool.inputSchema || {},
      }));

      if (apis.length > 0) {
        tools.push({
          identifier: server.identifier,
          manifest: {
            api: apis,
            author: 'Fi Market',
            homepage: 'https://ficlouds.com/market',
            identifier: server.identifier,
            meta: {
              avatar: server.icon || '🔗',
              description: `Fi Skill: ${server.name}`,
              tags: ['lobehub-skill', server.identifier],
              title: server.name,
            },
            type: 'builtin',
            version: '1.0.0',
          },
          type: 'plugin',
        });
      }
    }

    return tools;
  },

  /**
   * Get metadata list for all connected Fi Skill servers
   * Used by toolSelectors.metaList for unified tool metadata resolution
   */
  metaList: (s: ToolStoreState) => {
    const servers = s.fiSkillServers || [];

    return servers
      .filter((server) => server.status === FiSkillStatus.CONNECTED)
      .map((server) => ({
        identifier: server.identifier,
        meta: {
          avatar: server.icon || '🔗',
          description: `Fi Skill: ${server.name}`,
          title: server.name,
        },
      }));
  },
};
