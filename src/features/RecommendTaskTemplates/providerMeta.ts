import type {
  FiSkillProviderType,
  TaskTemplateSkillRequirement,
  TaskTemplateSkillSource,
} from '@ficlouds/const';
import { getKlavisServerByServerIdentifier, getFiSkillProviderById } from '@ficlouds/const';

export interface SkillProviderMeta {
  icon: FiSkillProviderType['icon'];
  label: string;
  provider: string;
  source: TaskTemplateSkillSource;
}

export const getProviderMeta = (
  spec: TaskTemplateSkillRequirement,
): SkillProviderMeta | undefined => {
  if (spec.source === 'lobehub') {
    const p = getFiSkillProviderById(spec.provider);
    if (!p) return undefined;
    return { icon: p.icon, label: p.label, provider: spec.provider, source: 'lobehub' };
  }
  const p = getKlavisServerByServerIdentifier(spec.provider);
  if (!p) return undefined;
  return { icon: p.icon, label: p.label, provider: spec.provider, source: 'klavis' };
};

export const findNextUnconnectedSpec = (
  specs: TaskTemplateSkillRequirement[] | undefined,
  isConnected: (spec: TaskTemplateSkillRequirement) => boolean,
): SkillProviderMeta | undefined => {
  if (!specs || specs.length === 0) return undefined;
  for (const spec of specs) {
    if (isConnected(spec)) continue;
    const meta = getProviderMeta(spec);
    if (!meta) continue;
    return meta;
  }
  return undefined;
};
