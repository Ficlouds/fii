export type OpenInAppId =
  | 'vscode'
  | 'cursor'
  | 'zed'
  | 'webstorm'
  | 'xcode'
  | 'finder'
  | 'explorer'
  | 'files'
  | 'terminal'
  | 'iterm2'
  | 'ghostty';

export interface DetectedApp {
  displayName: string;
  id: OpenInAppId;
  installed: boolean;
}

export interface DetectAppsResult {
  apps: DetectedApp[];
}

export interface OpenInAppParams {
  appId: OpenInAppId;
  path: string;
}

export interface OpenInAppResult {
  error?: string;
  success: boolean;
}
