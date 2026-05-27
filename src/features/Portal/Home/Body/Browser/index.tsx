import { Button, Flexbox, Icon, Text } from '@lobehub/ui';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';

import { DEFAULT_BROWSER_URL } from '../../../Browser/const';

export const BrowserLauncher = memo(() => {
  const { t } = useTranslation('portal');
  const openBrowser = useChatStore((s) => s.openBrowser);

  return (
    <Flexbox gap={8}>
      <Text as={'h5'} style={{ marginInline: 12 }}>
        {t('browser.title')}
      </Text>
      <Flexbox paddingInline={12}>
        <Button
          block
          icon={<Icon icon={Globe} />}
          onClick={() => openBrowser({ url: DEFAULT_BROWSER_URL })}
        >
          {t('browser.open')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

BrowserLauncher.displayName = 'BrowserLauncher';

export default BrowserLauncher;
