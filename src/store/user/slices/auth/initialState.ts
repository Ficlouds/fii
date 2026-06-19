import { type SSOProvider } from '@ficlouds/types';

import { type FiUser } from '@/types/user';

export interface UserAuthState {
  authProviders?: SSOProvider[];
  /**
   * Whether user registered with email/password (credential login)
   */
  hasPasswordAccount?: boolean;
  isLoaded?: boolean;
  isLoadedAuthProviders?: boolean;

  isSignedIn?: boolean;
  oAuthSSOProviders?: string[];
  user?: FiUser;
}

export const initialAuthState: UserAuthState = {};
