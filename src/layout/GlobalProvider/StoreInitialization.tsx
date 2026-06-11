'use client';

import { INBOX_SESSION_ID } from '@lobechat/const';
import { lazy, memo, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createStoreUpdater } from 'zustand-utils';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import { useUserStateRedirect } from './useUserStateRedirect';

const DeferredStoreInitialization = lazy(() => import('./DeferredStoreInitialization'));

const StoreInitialization = memo(() => {
  // prefetch error ns to avoid don't show error content correctly
  useTranslation('error');

  const [isLogin, mockUser, useInitUserState] = useUserStore((s) => [
    authSelectors.isLogin(s),
    s.user,
    s.useInitUserState,
  ]);

  const { serverConfig } = useServerConfigStore();

  const [useInitSystemStatus, useCheckServerVersion] = useGlobalStore((s) => [
    s.useInitSystemStatus,
    s.useCheckServerVersion,
  ]);

  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);

  // init the system preference
  useInitSystemStatus();

  // check server version in desktop app
  useCheckServerVersion();

  // fetch server config
  const useFetchServerConfig = useServerConfigStore((s) => s.useInitServerConfig);
  useFetchServerConfig();

  // Update NextAuth status
  const useUserStoreUpdater = createStoreUpdater(useUserStore);
  const oAuthSSOProviders = useServerConfigStore(serverConfigSelectors.oAuthSSOProviders);
  useUserStoreUpdater('oAuthSSOProviders', oAuthSSOProviders);

  /**
   * The store function of `isLogin` will both consider the values of `enableAuth` and `isSignedIn`.
   * But during initialization, the value of `enableAuth` might be incorrect cause of the async fetch.
   * So we need to use `isSignedIn` only to determine whether request for the default agent config and user state.
   *
   * IMPORTANT: Explicitly convert to boolean to avoid passing null/undefined downstream,
   * which would cause unnecessary API requests with invalid login state.
   */
  const isMockDevUser = __DEV__ && process.env.NEXT_PUBLIC_ENABLE_MOCK_DEV_USER === '1';

  const isLoginOnInit = Boolean(isLogin) || isMockDevUser;

  // The mock-dev-user bypass only covers server-side tRPC auth — Better-Auth's
  // real `useSession()` still has no session in this mode, so `UserUpdater`
  // keeps `isSignedIn` false and `user` empty, which would gate off
  // `useInitBuiltinAgent` (inbox) and the rest of the init below. Force the
  // store into a signed-in state for the mock user, mirroring the desktop
  // auth provider's `isSignedIn: true` override.
  useEffect(() => {
    if (!isMockDevUser) return;
    if (isLogin && mockUser?.id === process.env.NEXT_PUBLIC_MOCK_DEV_USER_ID) return;

    useUserStore.setState({
      isLoaded: true,
      isSignedIn: true,
      user: {
        email: process.env.NEXT_PUBLIC_MOCK_DEV_USER_EMAIL,
        id: process.env.NEXT_PUBLIC_MOCK_DEV_USER_ID!,
      },
    });
  }, [isMockDevUser, isLogin, mockUser]);

  // init inbox agent via builtin agent mechanism
  useInitBuiltinAgent(INBOX_SESSION_ID, { isLogin: isLoginOnInit });

  const onUserStateSuccess = useUserStateRedirect();

  // init user state
  useInitUserState(isLoginOnInit, serverConfig, {
    onSuccess: onUserStateSuccess,
  });

  const useStoreUpdater = createStoreUpdater(useGlobalStore);

  const mobile = useIsMobile();

  useStoreUpdater('isMobile', mobile);

  return (
    <Suspense>
      <DeferredStoreInitialization isLogin={isLoginOnInit} />
    </Suspense>
  );
});

export default StoreInitialization;
