'use client';

import { isDesktop } from '@ficlouds/const';
import { memo } from 'react';

import { SubscriptionIframeWrapper } from './SubscriptionIframeWrapper';

const Referral = memo(() => {
  if (!isDesktop) return null;
  return <SubscriptionIframeWrapper page="referral" />;
});

Referral.displayName = 'Referral';
export default Referral;
