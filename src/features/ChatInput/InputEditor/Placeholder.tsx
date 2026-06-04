import { KeyEnum } from '@lobechat/const/hotkeys';
import { combineKeys, Flexbox, Hotkey } from '@lobehub/ui';
import { memo, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useAgentId } from '@/features/ChatInput/hooks/useAgentId';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

export type PlaceholderVariant = 'default' | 'followUp';

interface PlaceholderProps {
  heterogeneousName?: string;
  showAgentAssignmentHint?: boolean;
  variant?: PlaceholderVariant;
}

const ROTATING_PLACEHOLDERS = [
  'What do you want to know?',
  'How can I help you today?',
  'Ask me anything...',
  'Start a task or explore an idea...',
  'What are you working on?',
];

const ROTATE_INTERVAL = 3000;

const Placeholder = memo<PlaceholderProps>(
  ({ heterogeneousName, showAgentAssignmentHint = false, variant = 'default' }) => {
    const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);
    const wrapperShortcut = useCmdEnterToSend
      ? KeyEnum.Enter
      : combineKeys([KeyEnum.Mod, KeyEnum.Enter]);
    const { t } = useTranslation('chat');

    const agentId = useAgentId();
    const enableAgentMode = useAgentStore(agentByIdSelectors.getAgentEnableModeById(agentId));

    const isHeterogeneous = !!heterogeneousName;

    const [rotatingIndex, setRotatingIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      if (isHeterogeneous || showAgentAssignmentHint || variant === 'followUp') return;
      const interval = setInterval(() => {
        setVisible(false);
        setTimeout(() => {
          setRotatingIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
          setVisible(true);
        }, 300);
      }, ROTATE_INTERVAL);
      return () => clearInterval(interval);
    }, [isHeterogeneous, showAgentAssignmentHint, variant]);

    if (variant === 'followUp') {
      return (
        <span>
          {t(isHeterogeneous ? 'followUpPlaceholderHeterogeneous' : 'followUpPlaceholder')}
        </span>
      );
    }

    if (isHeterogeneous) {
      const i18nKey = 'sendPlaceholderHeterogeneous';
      return (
        <Flexbox horizontal align={'center'} as={'span'} gap={4} wrap={'wrap'}>
          <Trans
            i18nKey={i18nKey}
            ns={'chat'}
            values={{ name: heterogeneousName }}
            components={{
              hotkey: (
                <Trans
                  i18nKey={'input.warpWithKey'}
                  ns={'chat'}
                  components={{
                    key: (
                      <Hotkey
                        as={'span'}
                        keys={wrapperShortcut}
                        style={{ color: 'inherit' }}
                        styles={{ kbdStyle: { color: 'inhert' } }}
                        variant={'borderless'}
                      />
                    ),
                  }}
                />
              ),
            }}
          />
        </Flexbox>
      );
    }

    if (showAgentAssignmentHint) {
      const i18nKey = enableAgentMode
        ? 'sendPlaceholderWithAgentAssignment'
        : 'sendPlaceholderChatWithAgentAssignment';
      return (
        <Flexbox horizontal align={'center'} as={'span'} gap={4} wrap={'wrap'}>
          <Trans
            i18nKey={i18nKey}
            ns={'chat'}
            components={{
              hotkey: (
                <Trans
                  i18nKey={'input.warpWithKey'}
                  ns={'chat'}
                  components={{
                    key: (
                      <Hotkey
                        as={'span'}
                        keys={wrapperShortcut}
                        style={{ color: 'inherit' }}
                        styles={{ kbdStyle: { color: 'inhert' } }}
                        variant={'borderless'}
                      />
                    ),
                  }}
                />
              ),
            }}
          />
        </Flexbox>
      );
    }

    return (
      <span
        style={{
          display: 'inline-block',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {ROTATING_PLACEHOLDERS[rotatingIndex]}
      </span>
    );
  },
);

export default Placeholder;
