import { WebBrowsingManifest, WebBrowsingPortal } from '@ficlouds/builtin-tool-web-browsing/client';
import { type BuiltinPortal } from '@ficlouds/types';

export const BuiltinToolsPortals: Record<string, BuiltinPortal> = {
  [WebBrowsingManifest.identifier]: WebBrowsingPortal as BuiltinPortal,
};
