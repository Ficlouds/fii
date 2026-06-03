'use client';
import { Suspense } from 'react';
import Loading from '@/components/Loading/BrandTextLoading';
import { SignInEmailStep } from './SignInEmailStep';
import { SignInOtpStep } from './SignInOtpStep';
import { useSignIn } from './useSignIn';

const SignInPage = () => {
  const {
    disableEmailPassword,
    email,
    form,
    handleBackToEmail,
    handleCheckUser,
    handleForgotPassword,
    handleSignIn,
    handleSendOtp,
    handleSocialSignIn,
    handleVerifyOtp,
    isSocialOnly,
    lastAuthProvider,
    loading,
    oAuthSSOProviders,
    serverConfigInit,
    socialLoading,
    step,
  } = useSignIn();

  return (
    <Suspense fallback={<Loading debugId={'Signin'} />}>
      {step === 'email' ? (
        <SignInEmailStep
          disableEmailPassword={disableEmailPassword}
          form={form as any}
          isSocialOnly={isSocialOnly}
          lastAuthProvider={lastAuthProvider}
          loading={loading}
          oAuthSSOProviders={oAuthSSOProviders}
          serverConfigInit={serverConfigInit}
          socialLoading={socialLoading}
          onCheckUser={handleCheckUser}
          onSetPassword={handleForgotPassword}
          onSocialSignIn={handleSocialSignIn}
        />
      ) : (
        <SignInOtpStep
          email={email}
          loading={loading}
          onBack={handleBackToEmail}
          onVerify={handleVerifyOtp as any}
          onResend={handleSendOtp as any}
        />
      )}
    </Suspense>
  );
};

export default SignInPage;
