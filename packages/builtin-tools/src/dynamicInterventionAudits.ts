import { pathScopeAudit } from '@ficlouds/builtin-tool-local-system';
import { type DynamicInterventionResolver } from '@ficlouds/types';

export const dynamicInterventionAudits: Record<string, DynamicInterventionResolver> = {
  pathScopeAudit,
};
