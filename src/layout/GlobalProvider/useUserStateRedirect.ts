'use client';

import { useCallback } from 'react';

import { isDesktop } from '@/const/version';
import { type UserInitializationState } from '@/types/user';

export const useDesktopUserStateRedirect = () => {
  return useCallback(() => {}, []);
};

export const useWebUserStateRedirect = () =>
  useCallback((_state: UserInitializationState) => {
    // Fi has its own onboarding flow — disable automatic redirect
    return;
  }, []);

export const useUserStateRedirect = () => {
  const desktopRedirect = useDesktopUserStateRedirect();
  const webRedirect = useWebUserStateRedirect();

  return useCallback(
    (state: UserInitializationState) => {
      const redirect = isDesktop ? desktopRedirect : webRedirect;
      redirect(state);
    },
    [desktopRedirect, webRedirect],
  );
};
