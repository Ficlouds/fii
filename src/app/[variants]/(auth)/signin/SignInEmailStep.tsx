import { Button, Flexbox, Icon, Input, Skeleton } from '@lobehub/ui';
import { type FormInstance, type InputRef } from 'antd';
import { Divider, Form } from 'antd';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import AuthCard from '../../../../features/AuthCard';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
export const USERNAME_REGEX = /^\w+$/;

export interface SignInEmailStepProps {
  disableEmailPassword?: boolean;
  form: FormInstance<{ email: string }>;
  isSocialOnly: boolean;
  lastAuthProvider?: string | null;
  loading: boolean;
  oAuthSSOProviders: string[];
  onCheckUser: (values: { email: string }) => Promise<void>;
  onSetPassword: () => void;
  onSocialSignIn: (provider: string) => void;
  serverConfigInit: boolean;
  socialLoading: string | null;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8, flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const SignInEmailStep = ({
  disableEmailPassword,
  form,
  loading,
  oAuthSSOProviders,
  serverConfigInit,
  socialLoading,
  onCheckUser,
  onSocialSignIn,
}: SignInEmailStepProps) => {
  const { t } = useTranslation('auth');
  const emailInputRef = useRef<InputRef>(null);
  useEffect(() => { emailInputRef.current?.focus(); }, []);

  return (
    <AuthCard title={'Log into your account'}>
      {!serverConfigInit && (
        <Flexbox gap={10}>
          <Skeleton.Button active block size="large" />
          <Skeleton.Button active block size="large" />
        </Flexbox>
      )}

      {serverConfigInit && (
        <Flexbox gap={10}>
          {oAuthSSOProviders.map((provider) => (
            <Button
              block key={provider}
              loading={socialLoading === provider}
              size="large"
              style={{ display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => onSocialSignIn(provider)}
            >
              {provider === 'google' && <GoogleIcon />}
              Login with {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </Button>
          ))}

          {/* Dummy Google button - replace with real OAuth later */}
          {!oAuthSSOProviders.includes('google') && (
            <Button
              block
              size="large"
              style={{ display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => alert('Google OAuth coming soon')}
            >
              <GoogleIcon />
              Login with Google
            </Button>
          )}

          {!disableEmailPassword && (
            <Divider style={{ margin:'8px 0' }}>
              <span style={{ color:'#bbb', fontSize:12 }}>or</span>
            </Divider>
          )}
        </Flexbox>
      )}

      {!disableEmailPassword && (
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => onCheckUser(values as { email: string })}
        >
          <Form.Item
            name="email"
            style={{ marginBottom: 10 }}
            rules={[
              { message: t('betterAuth.errors.emailRequired'), required: true },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const trimmed = (value as string).trim();
                  if (EMAIL_REGEX.test(trimmed) || USERNAME_REGEX.test(trimmed)) return Promise.resolve();
                  return Promise.reject(new Error(t('betterAuth.errors.emailInvalid')));
                },
              },
            ]}
          >
            <Input
              placeholder="Enter your email or username"
              ref={emailInputRef}
              size="large"
              prefix={<Icon icon={Mail} style={{ marginInline: 4, color: '#bbb' }} />}
            />
          </Form.Item>
          <Button
            block
            htmlType="submit"
            loading={loading}
            size="large"
            type="primary"
            style={{ marginTop: 4 }}
          >
            Continue
          </Button>
        </Form>
      )}

      <div style={{ textAlign:'center', marginTop:20 }}>
        <span style={{ fontSize:13, color:'#999' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color:'#000', fontWeight:500 }}>
            Sign up
          </Link>
        </span>
      </div>
    </AuthCard>
  );
};
