'use client';

import { DESKTOP_HEADER_ICON_SMALL_SIZE, isDesktop } from '@lobechat/const';
import { ActionIcon } from '@lobehub/ui';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

const BrowserToggle = memo(() => {
  const { t } = useTranslation('portal');
  const { pathname } = useLocation();
  const [showBrowser, openBrowser] = useChatStore((s) => [
    chatPortalSelectors.showBrowser(s),
    s.openBrowser,
  ]);

  if (!isDesktop || pathname.startsWith('/popup') || showBrowser) return null;

  return (
    <ActionIcon
      icon={Globe}
      size={DESKTOP_HEADER_ICON_SMALL_SIZE}
      title={t('browser.open')}
      onClick={() => openBrowser()}
    />
  );
});

BrowserToggle.displayName = 'BrowserToggle';

export default BrowserToggle;
