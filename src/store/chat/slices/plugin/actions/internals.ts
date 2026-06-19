import { builtinTools } from '@ficlouds/builtin-tools';
import { ToolArgumentsRepairer, ToolNameResolver } from '@ficlouds/context-engine';
import { type ChatToolPayload, type MessageToolCall, type ToolManifest } from '@ficlouds/types';

import { type ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import {
  klavisStoreSelectors,
  fiSkillStoreSelectors,
  pluginSelectors,
} from '@/store/tool/selectors';
import { type StoreSetter } from '@/store/types';

/**
 * Internal utility methods and runtime state management
 * These are building blocks used by other actions
 */

type Setter = StoreSetter<ChatStore>;
export const pluginInternals = (set: Setter, get: () => ChatStore, _api?: unknown) =>
  new PluginInternalsActionImpl(set, get, _api);

export class PluginInternalsActionImpl {
  constructor(set: Setter, get: () => ChatStore, _api?: unknown) {
    void _api;
    void set;
    void get;
  }

  internal_transformToolCalls = (
    toolCalls: MessageToolCall[],
    offeredToolNames?: string[],
  ): ChatToolPayload[] => {
    const toolNameResolver = new ToolNameResolver();

    // Build manifests map from tool store
    const toolStoreState = useToolStore.getState();
    const manifests: Record<string, ToolManifest> = {};

    // Track source for each identifier
    const sourceMap: Record<string, 'builtin' | 'mcp' | 'klavis' | 'fiSkill'> = {};

    // Get all installed plugins (all treated as MCP now)
    const installedPlugins = pluginSelectors.installedPlugins(toolStoreState);
    for (const plugin of installedPlugins) {
      if (plugin.manifest) {
        manifests[plugin.identifier] = plugin.manifest as ToolManifest;
        sourceMap[plugin.identifier] = 'mcp';
      }
    }

    // Get all builtin tools
    for (const tool of builtinTools) {
      if (tool.manifest) {
        manifests[tool.identifier] = tool.manifest as ToolManifest;
        sourceMap[tool.identifier] = 'builtin';
      }
    }

    // Get all Klavis tools
    const klavisTools = klavisStoreSelectors.klavisAsLobeTools(toolStoreState);
    for (const tool of klavisTools) {
      if (tool.manifest) {
        manifests[tool.identifier] = tool.manifest as ToolManifest;
        sourceMap[tool.identifier] = 'klavis';
      }
    }

    // Get all Fi Skill tools
    const fiSkillTools = fiSkillStoreSelectors.fiSkillAsLobeTools(toolStoreState);
    for (const tool of fiSkillTools) {
      if (tool.manifest) {
        manifests[tool.identifier] = tool.manifest as ToolManifest;
        sourceMap[tool.identifier] = 'fiSkill';
      }
    }

    // Resolve tool calls and add source field
    const resolved = toolNameResolver.resolve(toolCalls, manifests, offeredToolNames);

    return resolved.map((payload) => {
      // Parse and repair arguments if needed
      const manifest = manifests[payload.identifier];
      const repairer = new ToolArgumentsRepairer(manifest);
      const repairedArgs = repairer.parse(payload.apiName, payload.arguments);

      return {
        ...payload,
        arguments: JSON.stringify(repairedArgs),
        source: sourceMap[payload.identifier],
      };
    });
  };
}

export type PluginInternalsAction = Pick<
  PluginInternalsActionImpl,
  keyof PluginInternalsActionImpl
>;
