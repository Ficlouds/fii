import { type FiTool } from '@ficlouds/types';

export type PluginsSettings = Record<string, any>;

export interface PluginState {
  installedPlugins: FiTool[];
  loadingInstallPlugins: boolean;
  pluginInstallLoading: Record<string, boolean | undefined>;
  pluginsSettings: PluginsSettings;
  updatePluginSettingsSignal?: AbortController;
}

export const initialPluginState: PluginState = {
  installedPlugins: [],
  loadingInstallPlugins: true,
  pluginInstallLoading: {},
  pluginsSettings: {},
};
