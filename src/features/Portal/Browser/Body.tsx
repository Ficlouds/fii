'use client';

import { isDesktop } from '@lobechat/const';
import { Center, Empty, Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import { BROWSER_WEBVIEW_SESSION_ATTRIBUTE } from './const';
import { normalizeBrowserUrl } from './utils';

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    position: relative;

    overflow: hidden;
    flex: 1;

    width: 100%;
    height: 100%;

    background: ${cssVar.colorBgLayout};
  `,
  webview: css`
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;
    border: 0;
  `,
}));

const BrowserBody = memo(() => {
  const { t } = useTranslation('portal');
  const browser = useChatStore(chatPortalSelectors.currentBrowser);

  if (!browser) return null;

  if (!isDesktop) {
    return (
      <Center height={'100%'} width={'100%'}>
        <Empty description={t('browser.desktopOnly')} icon={Globe} />
      </Center>
    );
  }

  return (
    <Flexbox className={styles.container}>
      <webview
        className={styles.webview}
        key={browser.sessionId}
        src={normalizeBrowserUrl(browser.url)}
        {...{ [BROWSER_WEBVIEW_SESSION_ATTRIBUTE]: browser.sessionId }}
      />
    </Flexbox>
  );
});

BrowserBody.displayName = 'BrowserBody';

export default BrowserBody;
