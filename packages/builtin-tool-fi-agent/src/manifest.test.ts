import { describe, expect, it } from 'vitest';

import { FiAgentManifest } from './manifest';

describe('FiAgentManifest', () => {
  it('should keep the package metadata generic for future Lobe Agent capabilities', () => {
    expect(FiAgentManifest.meta.avatar).toBe('🤖');
    expect(FiAgentManifest.meta.description).toBe(
      'Run built-in Lobe Agent capabilities: plan + todo management, sub-agent dispatch, and visual media analysis.',
    );
    expect(FiAgentManifest.meta.readme).toContain(
      'built-in assistant capabilities that can be expanded over time',
    );
  });

  it('should describe visual analysis as a fallback tool', () => {
    const apiDescription = FiAgentManifest.api[0].description;

    expect(apiDescription).toContain('native multimodal capability');
    expect(apiDescription).toContain('use this tool only as a fallback');
    expect(apiDescription).toContain('Provide either refs or urls');
    expect(apiDescription).toContain('Prefer refs when stable refs are available');
    expect(apiDescription).toContain('msg_xxx.image_1');
    expect(apiDescription).toContain('use urls only for direct media URLs');
    expect(apiDescription).toContain('answer the user directly with the result');
  });

  it('should instruct agents to prefer native multimodal access before visual analysis', () => {
    expect(FiAgentManifest.systemRole).toContain('`analyzeVisualMedia` is only a fallback');
    expect(FiAgentManifest.systemRole).toContain(
      'media is already visible in the current multimodal context',
    );
    expect(FiAgentManifest.systemRole).toContain(
      'active model lacks the needed image/video capability',
    );
  });

  it('should keep visual analysis parameters compatible with strict tool schema validators', () => {
    const parameters = FiAgentManifest.api[0].parameters;

    expect(parameters).not.toHaveProperty('oneOf');
    expect(parameters).not.toHaveProperty('allOf');
    expect(parameters).not.toHaveProperty('anyOf');
  });
});
