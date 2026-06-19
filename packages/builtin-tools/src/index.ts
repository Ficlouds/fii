import { LobeActivatorManifest } from '@ficlouds/builtin-tool-activator';
import { AgentBuilderManifest } from '@ficlouds/builtin-tool-agent-builder';
import { AgentDocumentsManifest } from '@ficlouds/builtin-tool-agent-documents';
import { AgentManagementManifest } from '@ficlouds/builtin-tool-agent-management';
import { BriefManifest } from '@ficlouds/builtin-tool-brief';
import { CalculatorManifest } from '@ficlouds/builtin-tool-calculator';
import { CloudSandboxManifest } from '@ficlouds/builtin-tool-cloud-sandbox';
import { CredsManifest } from '@ficlouds/builtin-tool-creds';
import { GroupAgentBuilderManifest } from '@ficlouds/builtin-tool-group-agent-builder';
import { GroupManagementManifest } from '@ficlouds/builtin-tool-group-management';
import { KnowledgeBaseManifest } from '@ficlouds/builtin-tool-knowledge-base';
import { FiAgentManifest } from '@ficlouds/builtin-tool-fi-agent';
import { LocalSystemManifest } from '@ficlouds/builtin-tool-local-system';
import { MemoryManifest } from '@ficlouds/builtin-tool-memory';
import { MessageManifest } from '@ficlouds/builtin-tool-message';
import { PageAgentManifest } from '@ficlouds/builtin-tool-page-agent';
import { RemoteDeviceManifest } from '@ficlouds/builtin-tool-remote-device';
import { selfFeedbackIntentManifest } from '@ficlouds/builtin-tool-self-iteration';
import { SkillMaintainerManifest } from '@ficlouds/builtin-tool-skill-maintainer';
import { SkillStoreManifest } from '@ficlouds/builtin-tool-skill-store';
import { SkillsManifest } from '@ficlouds/builtin-tool-skills';
import { TaskManifest } from '@ficlouds/builtin-tool-task';
import { TopicReferenceManifest } from '@ficlouds/builtin-tool-topic-reference';
import { UserInteractionManifest } from '@ficlouds/builtin-tool-user-interaction';
import { WebBrowsingManifest } from '@ficlouds/builtin-tool-web-browsing';
import { WebOnboardingManifest } from '@ficlouds/builtin-tool-web-onboarding';
import { isDesktop, RECOMMENDED_SKILLS, RecommendedSkillType } from '@ficlouds/const';
import { type LobeBuiltinTool } from '@ficlouds/types';

/**
 * Default tool IDs that will always be added to the tools list.
 * Shared between frontend (createAgentToolsEngine) and server (createServerAgentToolsEngine).
 */
export const defaultToolIds = [
  LobeActivatorManifest.identifier,
  SkillsManifest.identifier,
  SkillStoreManifest.identifier,
  WebBrowsingManifest.identifier,
  KnowledgeBaseManifest.identifier,
  MemoryManifest.identifier,
  LocalSystemManifest.identifier,
  CloudSandboxManifest.identifier,
  TopicReferenceManifest.identifier,
  AgentDocumentsManifest.identifier,
  TaskManifest.identifier,
  FiAgentManifest.identifier,
];

/**
 * Tool IDs that are always enabled regardless of user selection.
 * These are core system tools that the agent needs to function properly.
 */
export const alwaysOnToolIds = [
  LobeActivatorManifest.identifier,
  SkillsManifest.identifier,
  SkillStoreManifest.identifier,
];

/**
 * Tool IDs to exclude from defaults when in manual skill-activate mode.
 * These are the tool/skill discovery tools that should be disabled when user wants precise control.
 * Other default tools (sandbox, web browsing, etc.) remain available if enabled externally.
 */
export const manualModeExcludeToolIds = [
  LobeActivatorManifest.identifier,
  SkillStoreManifest.identifier,
];

/**
 * Tool IDs allowed when the agent runs in chat mode
 * (`chatConfig.enableAgentMode === false`). Each one still passes through
 * its own runtime gate (e.g. knowledge base requires `hasEnabledKnowledgeBases`,
 * memory requires the global memory setting, web-browsing requires search
 * enabled) — this list is the strict outer whitelist.
 *
 * In chat mode, both the server `createServerAgentToolsEngine` and the
 * frontend `createAgentToolsEngine` build their rules from ONLY these
 * identifiers, drop user plugins / `alwaysOnToolIds` entirely, and disable
 * `allowExplicitActivation` so the activator can't smuggle other tools in.
 */
export const chatModeAllowedToolIds = [
  KnowledgeBaseManifest.identifier,
  MemoryManifest.identifier,
  WebBrowsingManifest.identifier,
];

/**
 * Tool IDs whose enabled state is decided by runtime / system conditions
 * (e.g. cloud runtime, agent has documents attached, knowledge base configured,
 * desktop gateway available), NOT by the user's plugin selection.
 *
 * The chat-input Tools popover deliberately hides these — even in manual
 * skill-activate mode — so users don't see a toggle that they can't actually
 * affect (the rules in `AgentToolsEngine.createEnableChecker` would force them
 * back on regardless of UI state).
 *
 * If you change this list, keep it in sync with the `rules` map in
 * `src/server/modules/Mecha/AgentToolsEngine/index.ts` and the matching frontend
 * `src/helpers/toolEngineering/index.ts`.
 */
export const runtimeManagedToolIds = [
  CloudSandboxManifest.identifier,
  KnowledgeBaseManifest.identifier,
  LocalSystemManifest.identifier,
  MemoryManifest.identifier,
  RemoteDeviceManifest.identifier,
  FiAgentManifest.identifier,
  WebBrowsingManifest.identifier,
];

export const builtinTools: LobeBuiltinTool[] = [
  {
    discoverable: false,
    hidden: true,
    identifier: LobeActivatorManifest.identifier,
    manifest: LobeActivatorManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: SkillsManifest.identifier,
    manifest: SkillsManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: SkillStoreManifest.identifier,
    manifest: SkillStoreManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: SkillMaintainerManifest.identifier,
    manifest: SkillMaintainerManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: selfFeedbackIntentManifest.identifier,
    manifest: selfFeedbackIntentManifest,
    type: 'builtin',
  },
  {
    discoverable: isDesktop,
    hidden: true,
    identifier: LocalSystemManifest.identifier,
    manifest: LocalSystemManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: MemoryManifest.identifier,
    manifest: MemoryManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: WebBrowsingManifest.identifier,
    manifest: WebBrowsingManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: CloudSandboxManifest.identifier,
    manifest: CloudSandboxManifest,
    type: 'builtin',
  },
  {
    identifier: AgentDocumentsManifest.identifier,
    manifest: AgentDocumentsManifest,
    type: 'builtin',
  },
  {
    identifier: CredsManifest.identifier,
    manifest: CredsManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: KnowledgeBaseManifest.identifier,
    manifest: KnowledgeBaseManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: PageAgentManifest.identifier,
    manifest: PageAgentManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: AgentBuilderManifest.identifier,
    manifest: AgentBuilderManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: GroupAgentBuilderManifest.identifier,
    manifest: GroupAgentBuilderManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: GroupManagementManifest.identifier,
    manifest: GroupManagementManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: AgentManagementManifest.identifier,
    manifest: AgentManagementManifest,
    type: 'builtin',
  },
  {
    identifier: CalculatorManifest.identifier,
    manifest: CalculatorManifest,
    type: 'builtin',
  },
  {
    identifier: MessageManifest.identifier,
    manifest: MessageManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: RemoteDeviceManifest.identifier,
    manifest: RemoteDeviceManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: TopicReferenceManifest.identifier,
    manifest: TopicReferenceManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: WebOnboardingManifest.identifier,
    manifest: WebOnboardingManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: UserInteractionManifest.identifier,
    manifest: UserInteractionManifest,
    type: 'builtin',
  },
  {
    identifier: TaskManifest.identifier,
    manifest: TaskManifest,
    type: 'builtin',
  },
  {
    discoverable: false,
    hidden: true,
    identifier: BriefManifest.identifier,
    manifest: BriefManifest,
    type: 'builtin',
  },
  {
    hidden: true,
    identifier: FiAgentManifest.identifier,
    manifest: FiAgentManifest,
    type: 'builtin',
  },
];

const recommendedBuiltinIds = new Set(
  RECOMMENDED_SKILLS.filter((s) => s.type === RecommendedSkillType.Builtin).map((s) => s.id),
);

/**
 * Non-hidden builtin tools that are NOT in RECOMMENDED_SKILLS.
 * These tools default to uninstalled and must be explicitly installed by the user from the Skill Store.
 */
export const defaultUninstalledBuiltinTools = builtinTools
  .filter((t) => !t.hidden && !recommendedBuiltinIds.has(t.identifier))
  .map((t) => t.identifier);
