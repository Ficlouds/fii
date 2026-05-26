'use client';

import { ActionIcon } from '@lobehub/ui';
import { Share2Icon } from 'lucide-react';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SMALL_SIZE } from '@/const/layoutTokens';
import SharePopover from '@/features/PageShare/SharePopover';

interface ShareButtonProps {
  documentId: string;
}

const ShareButton: FC<ShareButtonProps> = ({ documentId }) => {
  const { t } = useTranslation('pageShare');

  return (
    <SharePopover documentId={documentId}>
      <ActionIcon
        icon={Share2Icon}
        size={DESKTOP_HEADER_ICON_SMALL_SIZE}
        title={t('shareButton.label')}
      />
    </SharePopover>
  );
};

export default ShareButton;
