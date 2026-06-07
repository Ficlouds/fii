import { defineConfig } from '@/libs/next/proxy/define-config';

const { middleware } = defineConfig();

// required to be literal
export const config = {
  matcher: [
    // include any files in the api or trpc folders that might have an extension
    '/(api|trpc|webapi)(.*)',
    // include the /
    '/',
    '/community',
    '/community(.*)',
    '/labs',
    '/eval',
    '/eval(.*)',
    '/agent',
    '/agent(.*)',
    // Connect page is reached via full-page redirects from OAuth providers, so it must
    // be matched here — otherwise Next.js's default fallback redirects it to '/'
    '/connect',
    '/connect(.*)',
    // Composio redirects the OAuth tab here on success - a real Next.js page (not SPA),
    // so it needs both the matcher entry and the nextjsOnlyRoutes registration
    '/connect-success',
    '/connect-success(.*)',
    '/group',
    '/group(.*)',
    '/changelog(.*)',
    '/settings(.*)',
    '/image',
    '/video',
    '/resource',
    '/resource(.*)',
    '/profile(.*)',
    '/page',
    '/page(.*)',
    '/tasks',
    '/tasks(.*)',
    '/task',
    '/task(.*)',
    '/me',
    '/me(.*)',
    '/share(.*)',

    '/onboarding',
    '/onboarding(.*)',

    '/signup(.*)',
    '/signin(.*)',
    '/verify-email(.*)',
    '/verify-im(.*)',
    '/reset-password(.*)',
    '/auth-error(.*)',
    '/oauth(.*)',
    '/oidc(.*)',
    '/market-auth-callback(.*)',
  ],
};

export default middleware;
