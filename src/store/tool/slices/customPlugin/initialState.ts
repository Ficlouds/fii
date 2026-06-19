import { type FiToolCustomPlugin } from '@/types/tool/plugin';

export interface CustomPluginState {
  customPluginSearchKeywords?: string;
  newCustomPlugin: Partial<FiToolCustomPlugin>;
}
export const defaultCustomPlugin: Partial<FiToolCustomPlugin> = {
  customParams: {
    apiMode: 'simple',
    enableSettings: false,
    manifestMode: 'url',
  },
  type: 'customPlugin',
};

export const initialCustomPluginState: CustomPluginState = {
  customPluginSearchKeywords: '',
  newCustomPlugin: defaultCustomPlugin,
};
