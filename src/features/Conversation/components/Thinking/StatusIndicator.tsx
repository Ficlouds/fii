import { Block, Icon } from '@lobehub/ui';
import { Loader2Icon } from 'lucide-react';
import { memo } from 'react';

interface StatusIndicatorProps {
  showDetail?: boolean;
  thinking?: boolean;
}

const StatusIndicator = memo<StatusIndicatorProps>(({ thinking }) => {
  if (!thinking) return null;

  return (
    <Block
      horizontal
      align={'center'}
      flex={'none'}
      gap={4}
      height={24}
      justify={'center'}
      style={{ fontSize: 12 }}
      variant={'outlined'}
      width={24}
    >
      <Icon spin icon={Loader2Icon} />
    </Block>
  );
});

export default StatusIndicator;
