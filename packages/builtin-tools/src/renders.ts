import {
  LobeActivatorManifest,
  LobeActivatorRenders,
} from '@ficlouds/builtin-tool-activator/client';
import { AgentBuilderManifest } from '@ficlouds/builtin-tool-agent-builder';
import { AgentBuilderRenders } from '@ficlouds/builtin-tool-agent-builder/client';
import { AgentDocumentsManifest } from '@ficlouds/builtin-tool-agent-documents';
import { AgentDocumentsRenders } from '@ficlouds/builtin-tool-agent-documents/client';
import { AgentManagementManifest } from '@ficlouds/builtin-tool-agent-management';
import { AgentManagementRenders } from '@ficlouds/builtin-tool-agent-management/client';
import { ClaudeCodeIdentifier, ClaudeCodeRenders } from '@ficlouds/builtin-tool-claude-code/client';
import { CloudSandboxManifest } from '@ficlouds/builtin-tool-cloud-sandbox';
import { CloudSandboxRenders } from '@ficlouds/builtin-tool-cloud-sandbox/client';
import { GroupAgentBuilderManifest } from '@ficlouds/builtin-tool-group-agent-builder';
import { GroupAgentBuilderRenders } from '@ficlouds/builtin-tool-group-agent-builder/client';
import { GroupManagementManifest } from '@ficlouds/builtin-tool-group-management';
import { GroupManagementRenders } from '@ficlouds/builtin-tool-group-management/client';
import {
  KnowledgeBaseManifest,
  KnowledgeBaseRenders,
} from '@ficlouds/builtin-tool-knowledge-base/client';
import { FiAgentManifest, FiAgentRenders } from '@ficlouds/builtin-tool-fi-agent/client';
import {
  LocalSystemManifest,
  LocalSystemRenders,
} from '@ficlouds/builtin-tool-local-system/client';
import { MemoryManifest, MemoryRenders } from '@ficlouds/builtin-tool-memory/client';
import { MessageManifest, MessageRenders } from '@ficlouds/builtin-tool-message/client';
import { PageAgentManifest, PageAgentRenders } from '@ficlouds/builtin-tool-page-agent/client';
import { SkillStoreManifest, SkillStoreRenders } from '@ficlouds/builtin-tool-skill-store/client';
import { SkillsManifest, SkillsRenders } from '@ficlouds/builtin-tool-skills/client';
import { TaskManifest, TaskRenders } from '@ficlouds/builtin-tool-task/client';
import {
  WebBrowsingManifest,
  WebBrowsingRenders,
} from '@ficlouds/builtin-tool-web-browsing/client';
import {
  WebOnboardingManifest,
  WebOnboardingRenders,
} from '@ficlouds/builtin-tool-web-onboarding/client';
import { RunCommandRender } from '@ficlouds/shared-tool-ui/renders';
import { type BuiltinRender } from '@ficlouds/types';

import { CodexRenders } from './codex';
import { GithubIdentifier, GithubRenders } from './github';
import { NotebookIdentifier, NotebookRenders } from './notebook';

export interface BuiltinRenderRegistryEntry {
  apiName: string;
  identifier: string;
  render: BuiltinRender;
}

/**
 * Builtin tools renders registry
 * Organized by toolset (identifier) -> API name
 */
const BuiltinToolsRenders: Record<string, Record<string, BuiltinRender>> = {
  [AgentBuilderManifest.identifier]: AgentBuilderRenders as Record<string, BuiltinRender>,
  [AgentDocumentsManifest.identifier]: AgentDocumentsRenders as Record<string, BuiltinRender>,
  [AgentManagementManifest.identifier]: AgentManagementRenders as Record<string, BuiltinRender>,
  [ClaudeCodeIdentifier]: ClaudeCodeRenders as Record<string, BuiltinRender>,
  [CloudSandboxManifest.identifier]: CloudSandboxRenders as Record<string, BuiltinRender>,
  [GroupAgentBuilderManifest.identifier]: GroupAgentBuilderRenders as Record<string, BuiltinRender>,
  [GroupManagementManifest.identifier]: GroupManagementRenders as Record<string, BuiltinRender>,
  [KnowledgeBaseManifest.identifier]: KnowledgeBaseRenders as Record<string, BuiltinRender>,
  [FiAgentManifest.identifier]: FiAgentRenders as Record<string, BuiltinRender>,
  [LocalSystemManifest.identifier]: LocalSystemRenders as Record<string, BuiltinRender>,
  [MemoryManifest.identifier]: MemoryRenders as Record<string, BuiltinRender>,
  [MessageManifest.identifier]: MessageRenders as Record<string, BuiltinRender>,
  [NotebookIdentifier]: NotebookRenders,
  [PageAgentManifest.identifier]: PageAgentRenders as Record<string, BuiltinRender>,
  [SkillStoreManifest.identifier]: SkillStoreRenders as Record<string, BuiltinRender>,
  [SkillsManifest.identifier]: SkillsRenders as Record<string, BuiltinRender>,
  [TaskManifest.identifier]: TaskRenders as Record<string, BuiltinRender>,
  [LobeActivatorManifest.identifier]: LobeActivatorRenders as Record<string, BuiltinRender>,
  [WebBrowsingManifest.identifier]: WebBrowsingRenders as Record<string, BuiltinRender>,
  [WebOnboardingManifest.identifier]: WebOnboardingRenders as Record<string, BuiltinRender>,
  codex: {
    ...CodexRenders,
    command_execution: RunCommandRender as BuiltinRender,
  },
  [GithubIdentifier]: GithubRenders,
};

export const listBuiltinRenderEntries = (): BuiltinRenderRegistryEntry[] =>
  Object.entries(BuiltinToolsRenders).flatMap(([identifier, toolset]) =>
    Object.entries(toolset)
      .filter((entry): entry is [string, BuiltinRender] => !!entry[1])
      .map(([apiName, render]) => ({
        apiName,
        identifier,
        render,
      })),
  );

/**
 * Get builtin render component for a specific API
 * @param identifier - Tool identifier (e.g., 'lobe-local-system')
 * @param apiName - API name (e.g., 'searchFiles')
 */
export const getBuiltinRender = (
  identifier?: string,
  apiName?: string,
): BuiltinRender | undefined => {
  if (!identifier) return undefined;

  const toolset = BuiltinToolsRenders[identifier];
  if (!toolset) return undefined;

  if (apiName && toolset[apiName]) {
    return toolset[apiName];
  }

  return undefined;
};

export { getBuiltinRenderDisplayControl } from './displayControls';
