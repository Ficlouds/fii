import type { ToolManifest, ToolManifestType } from './manifest';
import type { CustomPluginParams } from './plugin';
import type { FiToolType } from './tool';

export interface FiTool {
  customParams?: CustomPluginParams | null;
  identifier: string;
  manifest?: ToolManifest | null;
  /**
   * use for runtime
   */
  runtimeType?: ToolManifestType;
  settings?: any;
  // TODO: remove type and then make it required
  source?: FiToolType;
  /**
   * need to be replaced with source
   * @deprecated
   */
  type: FiToolType;
}

export type FiToolRenderType = ToolManifestType;

export * from './builtin';
export * from './crawler';
export * from './error';
export * from './interpreter';
export * from './intervention';
export * from './manifest';
export * from './plugin';
export * from './search';
export * from './tool';
export * from './visualRef';
