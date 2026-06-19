import { LobeActivatorManifest } from '@ficlouds/builtin-tool-activator';
import { AgentBuilderManifest } from '@ficlouds/builtin-tool-agent-builder';
import { AgentDocumentsManifest } from '@ficlouds/builtin-tool-agent-documents';
import { AgentManagementManifest } from '@ficlouds/builtin-tool-agent-management';
import { CalculatorManifest } from '@ficlouds/builtin-tool-calculator';
import { CloudSandboxManifest } from '@ficlouds/builtin-tool-cloud-sandbox';
import { CredsManifest } from '@ficlouds/builtin-tool-creds';
import { GroupAgentBuilderManifest } from '@ficlouds/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@ficlouds/builtin-tool-group-management';
import { KnowledgeBaseManifest } from '@ficlouds/builtin-tool-knowledge-base';
import { FiAgentManifest } from '@ficlouds/builtin-tool-fi-agent';
import { LocalSystemManifest } from '@ficlouds/builtin-tool-local-system';
import { MemoryManifest } from '@ficlouds/builtin-tool-memory';
import { NotebookManifest } from '@ficlouds/builtin-tool-notebook';
import { PageAgentManifest } from '@ficlouds/builtin-tool-page-agent';
import { selfFeedbackIntentManifest } from '@ficlouds/builtin-tool-self-iteration';
import { SkillStoreManifest } from '@ficlouds/builtin-tool-skill-store';
import { SkillsManifest } from '@ficlouds/builtin-tool-skills';
import { TopicReferenceManifest } from '@ficlouds/builtin-tool-topic-reference';
import { UserInteractionManifest } from '@ficlouds/builtin-tool-user-interaction';
import { WebBrowsingManifest } from '@ficlouds/builtin-tool-web-browsing';
import { WebOnboardingManifest } from '@ficlouds/builtin-tool-web-onboarding';

export const builtinToolIdentifiers: string[] = [
  AgentBuilderManifest.identifier,
  AgentDocumentsManifest.identifier,
  AgentManagementManifest.identifier,
  CalculatorManifest.identifier,
  CloudSandboxManifest.identifier,
  CredsManifest.identifier,
  GroupAgentBuilderManifest.identifier,
  GroupManagementManifest.identifier,
  KnowledgeBaseManifest.identifier,
  LocalSystemManifest.identifier,
  MemoryManifest.identifier,
  NotebookManifest.identifier,
  PageAgentManifest.identifier,
  selfFeedbackIntentManifest.identifier,
  SkillsManifest.identifier,
  SkillStoreManifest.identifier,
  TopicReferenceManifest.identifier,
  LobeActivatorManifest.identifier,
  WebBrowsingManifest.identifier,
  UserInteractionManifest.identifier,
  FiAgentManifest.identifier,
  WebOnboardingManifest.identifier,
];
