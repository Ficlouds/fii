import {
  LobeActivatorInspectors,
  LobeActivatorManifest,
} from '@ficlouds/builtin-tool-activator/client';
import {
  AgentBuilderInspectors,
  AgentBuilderManifest,
} from '@ficlouds/builtin-tool-agent-builder/client';
import {
  AgentDocumentsInspectors,
  AgentDocumentsManifest,
} from '@ficlouds/builtin-tool-agent-documents/client';
import {
  AgentManagementInspectors,
  AgentManagementManifest,
} from '@ficlouds/builtin-tool-agent-management/client';
import {
  ClaudeCodeIdentifier,
  ClaudeCodeInspectors,
} from '@ficlouds/builtin-tool-claude-code/client';
import {
  CloudSandboxIdentifier,
  CloudSandboxInspectors,
} from '@ficlouds/builtin-tool-cloud-sandbox/client';
import {
  GroupAgentBuilderInspectors,
  GroupAgentBuilderManifest,
} from '@ficlouds/builtin-tool-group-agent-builder/client';
import {
  GroupManagementInspectors,
  GroupManagementManifest,
} from '@ficlouds/builtin-tool-group-management/client';
import {
  KnowledgeBaseInspectors,
  KnowledgeBaseManifest,
} from '@ficlouds/builtin-tool-knowledge-base/client';
import { FiAgentInspectors, FiAgentManifest } from '@ficlouds/builtin-tool-fi-agent/client';
import {
  LocalSystemInspectors,
  LocalSystemManifest,
} from '@ficlouds/builtin-tool-local-system/client';
import { MemoryInspectors, MemoryManifest } from '@ficlouds/builtin-tool-memory/client';
import { MessageInspectors, MessageManifest } from '@ficlouds/builtin-tool-message/client';
import { PageAgentInspectors, PageAgentManifest } from '@ficlouds/builtin-tool-page-agent/client';
import {
  SelfFeedbackIntentInspectors,
  selfFeedbackIntentManifest,
} from '@ficlouds/builtin-tool-self-iteration/client';
import {
  SkillStoreInspectors,
  SkillStoreManifest,
} from '@ficlouds/builtin-tool-skill-store/client';
import { SkillsInspectors, SkillsManifest } from '@ficlouds/builtin-tool-skills/client';
import { TaskInspectors, TaskManifest } from '@ficlouds/builtin-tool-task/client';
import {
  WebBrowsingInspectors,
  WebBrowsingManifest,
} from '@ficlouds/builtin-tool-web-browsing/client';
import {
  WebOnboardingInspectors,
  WebOnboardingManifest,
} from '@ficlouds/builtin-tool-web-onboarding/client';
import { createRunCommandInspector } from '@ficlouds/shared-tool-ui/inspectors';
import type { BuiltinInspector } from '@ficlouds/types';

import { CodexInspectors } from './codex';
import { GithubIdentifier, GithubInspectors } from './github';
import { LinearIdentifier, LinearInspectors } from './linear';
import { TwitterIdentifier, TwitterInspectors } from './twitter';

/**
 * Builtin tools inspector registry
 * Organized by toolset (identifier) -> API name
 *
 * Inspector components are used to customize the title/header area
 * of tool calls in the conversation UI.
 */
const BuiltinToolInspectors: Record<string, Record<string, BuiltinInspector>> = {
  [AgentBuilderManifest.identifier]: AgentBuilderInspectors as Record<string, BuiltinInspector>,
  [AgentDocumentsManifest.identifier]: AgentDocumentsInspectors as Record<string, BuiltinInspector>,
  [AgentManagementManifest.identifier]: AgentManagementInspectors as Record<
    string,
    BuiltinInspector
  >,
  [ClaudeCodeIdentifier]: ClaudeCodeInspectors as Record<string, BuiltinInspector>,
  [CloudSandboxIdentifier]: CloudSandboxInspectors as Record<string, BuiltinInspector>,
  [GroupAgentBuilderManifest.identifier]: GroupAgentBuilderInspectors as Record<
    string,
    BuiltinInspector
  >,
  [GroupManagementManifest.identifier]: GroupManagementInspectors as Record<
    string,
    BuiltinInspector
  >,
  [KnowledgeBaseManifest.identifier]: KnowledgeBaseInspectors as Record<string, BuiltinInspector>,
  [FiAgentManifest.identifier]: FiAgentInspectors as Record<string, BuiltinInspector>,
  [LocalSystemManifest.identifier]: LocalSystemInspectors as Record<string, BuiltinInspector>,
  [MemoryManifest.identifier]: MemoryInspectors as Record<string, BuiltinInspector>,
  [MessageManifest.identifier]: MessageInspectors as Record<string, BuiltinInspector>,
  [PageAgentManifest.identifier]: PageAgentInspectors as Record<string, BuiltinInspector>,
  [LobeActivatorManifest.identifier]: LobeActivatorInspectors as Record<string, BuiltinInspector>,
  [selfFeedbackIntentManifest.identifier]: SelfFeedbackIntentInspectors as Record<
    string,
    BuiltinInspector
  >,
  [SkillStoreManifest.identifier]: SkillStoreInspectors as Record<string, BuiltinInspector>,
  [SkillsManifest.identifier]: SkillsInspectors as Record<string, BuiltinInspector>,
  [TaskManifest.identifier]: TaskInspectors as Record<string, BuiltinInspector>,
  [WebBrowsingManifest.identifier]: WebBrowsingInspectors as Record<string, BuiltinInspector>,
  [WebOnboardingManifest.identifier]: WebOnboardingInspectors as Record<string, BuiltinInspector>,
  codex: {
    ...CodexInspectors,
    command_execution: createRunCommandInspector('Run') as BuiltinInspector,
  },
  [GithubIdentifier]: GithubInspectors,
  [LinearIdentifier]: LinearInspectors,
  [TwitterIdentifier]: TwitterInspectors,
};

export interface BuiltinInspectorRegistryEntry {
  apiName: string;
  identifier: string;
  inspector: BuiltinInspector;
}

export const listBuiltinInspectorEntries = (): BuiltinInspectorRegistryEntry[] =>
  Object.entries(BuiltinToolInspectors).flatMap(([identifier, toolset]) =>
    Object.entries(toolset)
      .filter((entry): entry is [string, BuiltinInspector] => !!entry[1])
      .map(([apiName, inspector]) => ({
        apiName,
        identifier,
        inspector,
      })),
  );

/**
 * Get builtin inspector component for a specific API
 * @param identifier - Tool identifier (e.g., 'lobe-code-interpreter')
 * @param apiName - API name (e.g., 'executeCode')
 */
export const getBuiltinInspector = (
  identifier?: string,
  apiName?: string,
): BuiltinInspector | undefined => {
  if (!identifier || !apiName) return undefined;

  const toolset = BuiltinToolInspectors[identifier];
  if (!toolset) return undefined;

  return toolset[apiName];
};
