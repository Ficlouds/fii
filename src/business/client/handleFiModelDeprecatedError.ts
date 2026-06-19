import { ChatErrorType } from '@ficlouds/types';
import { TRPCClientError } from '@trpc/client';
import { t } from 'i18next';

import { message } from '@/components/AntdStaticMethods';

interface FiModelDeprecatedErrorData {
  modelType?: string;
  requestedModel?: string;
}

export const handleFiModelDeprecatedError = (error: unknown) => {
  if (!(error instanceof TRPCClientError) || error.message !== ChatErrorType.FiModelDeprecated)
    return;

  const requestedModel = (error.data?.errorData as FiModelDeprecatedErrorData | undefined)
    ?.requestedModel;

  message.error(
    t('response.FiModelDeprecated', {
      model: requestedModel ?? '-',
      ns: 'error',
    }),
  );
};
