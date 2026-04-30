import { t } from 'i18next';

import { notification } from '@/components/AntdStaticMethods';

const formatPayload = (payload: Record<string, unknown>) => {
  const compactPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(compactPayload).length === 0) {
    return t('agentSignal.notification.empty', { ns: 'chat' });
  }

  return JSON.stringify(compactPayload);
};

export const showAgentSignalNotification = (input: {
  payload: Record<string, unknown>;
  sourceType: string;
}) => {
  notification?.info?.({
    description: formatPayload(input.payload),
    duration: 6,
    message: t('agentSignal.notification.triggered', {
      ns: 'chat',
      sourceType: input.sourceType,
    }),
    placement: 'bottomRight',
  });
};
