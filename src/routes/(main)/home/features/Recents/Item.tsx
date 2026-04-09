import { Block, Flexbox, Icon, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { BotMessageSquareIcon, CheckSquareIcon, FileIcon, FileTextIcon } from 'lucide-react';
import { memo } from 'react';

import { type RecentItem } from '@/server/routers/lambda/recent';

const TYPE_ICON_MAP = {
  document: FileTextIcon,
  file: FileIcon,
  task: CheckSquareIcon,
  topic: BotMessageSquareIcon,
};

const RecentListItem = memo<RecentItem>(({ title, type }) => {
  const IconComponent = TYPE_ICON_MAP[type] || FileIcon;

  return (
    <Block clickable height={40} variant={'borderless'}>
      <Flexbox horizontal align={'center'} gap={12} height={'100%'} paddingInline={8}>
        <Icon color={cssVar.colorTextDescription} icon={IconComponent} size={18} />
        <Text ellipsis style={{ flex: 1 }}>
          {title}
        </Text>
      </Flexbox>
    </Block>
  );
});

export default RecentListItem;
