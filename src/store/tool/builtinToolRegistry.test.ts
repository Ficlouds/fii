import { WEB_ONBOARDING } from '@ficlouds/builtin-agents';
import {
  GroupAgentBuilderApiName,
  GroupAgentBuilderIdentifier,
} from '@ficlouds/builtin-tool-group-agent-builder';
import { GroupAgentBuilderInspectors } from '@ficlouds/builtin-tool-group-agent-builder/client';
import { SkillStoreApiName, SkillStoreIdentifier } from '@ficlouds/builtin-tool-skill-store';
import { SkillStoreInspectors, SkillStoreRenders } from '@ficlouds/builtin-tool-skill-store/client';
import { UserInteractionIdentifier } from '@ficlouds/builtin-tool-user-interaction';
import {
  WebOnboardingApiName,
  WebOnboardingIdentifier,
  WebOnboardingManifest,
} from '@ficlouds/builtin-tool-web-onboarding';
import { builtinToolIdentifiers } from '@ficlouds/builtin-tools/identifiers';
import { describe, expect, it } from 'vitest';

describe('builtin tool registry', () => {
  it('includes skill store in builtin identifiers', () => {
    expect(builtinToolIdentifiers).toContain(SkillStoreIdentifier);
  });

  it('includes web onboarding in builtin identifiers', () => {
    expect(builtinToolIdentifiers).toContain(WebOnboardingIdentifier);
  });

  it('registers skill store inspectors and renders for market flows', () => {
    expect(SkillStoreInspectors[SkillStoreApiName.importFromMarket]).toBeDefined();
    expect(SkillStoreInspectors[SkillStoreApiName.searchSkill]).toBeDefined();
    expect(SkillStoreRenders[SkillStoreApiName.importFromMarket]).toBeDefined();
    expect(SkillStoreRenders[SkillStoreApiName.searchSkill]).toBeDefined();
  });

  it('registers group agent builder createGroup inspector', () => {
    expect(builtinToolIdentifiers).toContain(GroupAgentBuilderIdentifier);
    expect(GroupAgentBuilderInspectors[GroupAgentBuilderApiName.createGroup]).toBeDefined();
  });

  it('includes user interaction and web onboarding in web onboarding runtime plugins', () => {
    const runtime =
      typeof WEB_ONBOARDING.runtime === 'function'
        ? WEB_ONBOARDING.runtime({ userLocale: 'en-US' })
        : WEB_ONBOARDING.runtime;

    expect(runtime.plugins).toContain(UserInteractionIdentifier);
    expect(runtime.plugins).toContain(WebOnboardingIdentifier);
  });

  it('exposes the marketplace APIs under the web onboarding manifest', () => {
    const apiNames = WebOnboardingManifest.api.map((entry) => entry.name);
    expect(apiNames).toContain(WebOnboardingApiName.showAgentMarketplace);
    expect(apiNames).toContain(WebOnboardingApiName.submitAgentPick);
  });
});
