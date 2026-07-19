'use client';

import { Button, Flexbox } from '@lobehub/ui';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import { memo } from 'react';

import AuthCard from '@/features/AuthCard';

const normalizeErrorCode = (code?: string | null) =>
  (code || 'UNKNOWN').trim().toUpperCase().replaceAll('-', '_');

const AuthErrorPage = memo(() => {
  const [error] = useQueryState('error', parseAsString);
  const code = normalizeErrorCode(error);
  const isCancelled = error === 'access_denied' || error === 'OAuthCallback';

  return (
    <AuthCard
      title={isCancelled ? 'Sign in incomplete.' : 'Something went wrong.'}
      subtitle={
        isCancelled
          ? 'Try again when you are ready.'
          : 'Fi could not complete the sign in. Try again or use a different method.'
      }
      footer={
        <Flexbox gap={10}>
          <Link href="/signin" style={{ width:'100%' }}>
            <Button block size={'large'} type="primary">
              {isCancelled ? 'Try again' : 'Back to sign in'}
            </Button>
          </Link>
          <Link href="/signup" style={{ width:'100%' }}>
            <Button block size={'large'}>
              Create an account
            </Button>
          </Link>
          <Link href="/" style={{ width:'100%' }}>
            <Button block size={'large'} type="text">
              Back to home
            </Button>
          </Link>
        </Flexbox>
      }
    >
      {!isCancelled && (
        <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
          Error: {code}
        </p>
      )}
    </AuthCard>
  );
});

AuthErrorPage.displayName = 'AuthErrorPage';

export default AuthErrorPage;
