import { Icon } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ArrowUpIcon, SquareIcon } from 'lucide-react';
import { memo } from 'react';

import { selectors, useChatInputStore } from '../store';

const styles = createStaticStyles(({ css }) => ({
  button: css`
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;

    color: #fff;
    background: #000;

    cursor: pointer;
    transition: background 0.15s ease, opacity 0.15s ease;

    &:disabled {
      cursor: default;
      background: rgba(0, 0, 0, 0.15);
    }
  `,
}));

const SendButton = memo(() => {
  const { generating, disabled } = useChatInputStore(selectors.sendButtonProps, isEqual);
  const [send, handleStop] = useChatInputStore((s) => [s.handleSendButton, s.handleStop]);

  return (
    <button
      className={styles.button}
      disabled={disabled}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (generating) {
          handleStop();
        } else {
          send();
        }
      }}
    >
      <Icon icon={generating ? SquareIcon : ArrowUpIcon} size={13} />
    </button>
  );
});

SendButton.displayName = 'SendButton';

export default SendButton;
