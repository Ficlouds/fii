'use client';

import { Button, Icon } from '@lobehub/ui';
import { Form, Input, type InputRef } from 'antd';
import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthCard } from '../../../../../features/AuthCard';
import { type SignUpFormValues } from './useSignUp';
import { useSignUp } from './useSignUp';

const BetterAuthSignUpForm = () => {
  const [form] = Form.useForm<SignUpFormValues>();
  const { loading, onSubmit, businessElement } = useSignUp();
  const { t } = useTranslation('auth');
  const searchParams = useSearchParams();
  const emailInputRef = useRef<InputRef>(null);
  const passwordInputRef = useRef<InputRef>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      form.setFieldsValue({ email });
      passwordInputRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
  }, [searchParams, form]);

  return (
    <AuthCard title={'Create your account'}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="email"
          rules={[
            { message: t('betterAuth.errors.emailRequired'), required: true },
            { message: t('betterAuth.errors.emailInvalid'), type: 'email' },
          ]}
        >
          <Input
            placeholder="Email address"
            ref={emailInputRef}
            size="large"
            prefix={<Icon icon={Mail} style={{ marginInline: 6, color: '#bbb' }} />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { message: t('betterAuth.errors.passwordRequired'), required: true },
            { message: t('betterAuth.errors.passwordMinLength'), min: 8 },
          ]}
        >
          <Input.Password
            placeholder="Password"
            ref={passwordInputRef}
            size="large"
            prefix={<Icon icon={Lock} style={{ marginInline: 6, color: '#bbb' }} />}
          />
        </Form.Item>
        <Form.Item
          dependencies={['password']}
          name="confirmPassword"
          rules={[
            { message: t('betterAuth.errors.confirmPasswordRequired'), required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error(t('betterAuth.errors.passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm password"
            size="large"
            prefix={<Icon icon={Lock} style={{ marginInline: 6, color: '#bbb' }} />}
          />
        </Form.Item>

        {businessElement}

        <Form.Item style={{ marginBottom: 0 }}>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            Create account
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <span style={{ fontSize: 13, color: '#999' }}>
          Already have an account?{' '}
          <Link href={`/signin?${searchParams.toString()}`} style={{ color: '#000', fontWeight: 500 }}>
            Sign in
          </Link>
        </span>
      </div>
    </AuthCard>
  );
};

export default BetterAuthSignUpForm;
