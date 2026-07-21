'use client';

import { Button, Icon } from '@lobehub/ui';
import { Form, Input, type InputRef } from 'antd';
import { Mail } from 'lucide-react';
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

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      form.setFieldsValue({ email });
    } else {
      emailInputRef.current?.focus();
    }
  }, [searchParams, form]);

  return (
    <AuthCard title={'Nice to meet you.'}>
      <style>{`
        .ant-form-item-explain-error { text-align: center !important; font-size: 12px !important; margin-top: 6px !important; }
      `}</style>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          style={{ marginBottom: 28 }}
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

        {businessElement}

        <Form.Item style={{ marginBottom: 0 }}>
          <Button block htmlType="submit" loading={loading} size="large" type="primary">
            Get started
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <span style={{ fontSize: 13, color: '#666' }}>
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
