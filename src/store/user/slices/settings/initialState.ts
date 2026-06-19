import { DEFAULT_SETTINGS } from '@ficlouds/config';
import { type UserSettings } from '@ficlouds/types';
import { type PartialDeep } from 'type-fest';

export interface UserSettingsState {
  defaultSettings: UserSettings;
  settings: PartialDeep<UserSettings>;
  updateSettingsSignal?: AbortController;
}

export const initialSettingsState: UserSettingsState = {
  defaultSettings: DEFAULT_SETTINGS,
  settings: {},
};
