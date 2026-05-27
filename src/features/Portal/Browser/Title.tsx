'use client';

import { DESKTOP_HEADER_ICON_SMALL_SIZE, isDesktop } from '@lobechat/const';
import { ActionIcon, Flexbox, Input } from '@lobehub/ui';
import { message } from 'antd';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { electronBrowserSidebarService } from '@/services/electron/browserSidebar';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import { useBrowserSidebarState } from './useBrowserSidebarState';
import { normalizeBrowserUrl } from './utils';

const BrowserTitle = memo(() => {
  const { t } = useTranslation('portal');
  const browser = useChatStore(chatPortalSelectors.currentBrowser);
  const state = useBrowserSidebarState(browser?.sessionId, browser?.url);
  const [address, setAddress] = useState(state.url);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setAddress(state.url);
  }, [isEditing, state.url]);

  if (!browser) return null;

  const runAction = async (action: () => Promise<{ error?: string; success: boolean }>) => {
    try {
      const result = await action();
      if (!result.success) {
        message.error(result.error || t('browser.actions.failed'));
      }
    } catch (error) {
      console.error('[BrowserSidebar] Browser action failed:', error);
      message.error(t('browser.actions.failed'));
    }
  };

  const navigate = async () => {
    const url = normalizeBrowserUrl(address);
    setAddress(url);
    await runAction(() =>
      electronBrowserSidebarService.navigate({ sessionId: browser.sessionId, url }),
    );
  };

  return (
    <Flexbox horizontal align={'center'} flex={1} gap={6} width={'100%'}>
      <ActionIcon
        disabled={!isDesktop || !state.canGoBack}
        icon={ChevronLeft}
        size={DESKTOP_HEADER_ICON_SMALL_SIZE}
        title={t('browser.actions.back')}
        onClick={() =>
          runAction(() => electronBrowserSidebarService.goBack({ sessionId: browser.sessionId }))
        }
      />
      <ActionIcon
        disabled={!isDesktop || !state.canGoForward}
        icon={ChevronRight}
        size={DESKTOP_HEADER_ICON_SMALL_SIZE}
        title={t('browser.actions.forward')}
        onClick={() =>
          runAction(() => electronBrowserSidebarService.goForward({ sessionId: browser.sessionId }))
        }
      />
      <ActionIcon
        disabled={!isDesktop}
        icon={state.isLoading ? XCircle : RefreshCw}
        size={DESKTOP_HEADER_ICON_SMALL_SIZE}
        title={state.isLoading ? t('browser.actions.stop') : t('browser.actions.reload')}
        onClick={() =>
          runAction(() =>
            state.isLoading
              ? electronBrowserSidebarService.stop({ sessionId: browser.sessionId })
              : electronBrowserSidebarService.reload({ sessionId: browser.sessionId }),
          )
        }
      />
      <Input
        allowClear
        prefix={<Search size={14} />}
        size={'small'}
        style={{ flex: 1, minWidth: 120 }}
        value={address}
        onBlur={() => setIsEditing(false)}
        onFocus={() => setIsEditing(true)}
        onChange={(event) => {
          setIsEditing(true);
          setAddress(event.target.value);
        }}
        onPressEnter={() => {
          setIsEditing(false);
          void navigate();
        }}
      />
      <ActionIcon
        disabled={!isDesktop || !state.url}
        icon={ExternalLink}
        size={DESKTOP_HEADER_ICON_SMALL_SIZE}
        title={t('browser.actions.openExternal')}
        onClick={() =>
          runAction(() =>
            electronBrowserSidebarService.openExternal({ sessionId: browser.sessionId }),
          )
        }
      />
      <ActionIcon
        disabled={!isDesktop || !state.attached}
        icon={Camera}
        size={DESKTOP_HEADER_ICON_SMALL_SIZE}
        title={t('browser.actions.capture')}
        onClick={() =>
          runAction(() =>
            electronBrowserSidebarService.captureScreenshotToClipboard({
              sessionId: browser.sessionId,
            }),
          )
        }
      />
    </Flexbox>
  );
});

BrowserTitle.displayName = 'BrowserTitle';

export default BrowserTitle;
