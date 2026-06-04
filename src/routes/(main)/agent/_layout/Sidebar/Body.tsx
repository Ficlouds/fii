import { Flexbox } from '@lobehub/ui';
import React, { memo } from 'react';
import Topic from './Topic';

export enum ChatSidebarKey {
  Tasks = 'tasks',
  Topic = 'topic',
}

const Body = memo(() => {
  return (
    <Flexbox paddingInline={4}>
      <Topic itemKey={ChatSidebarKey.Topic} />
    </Flexbox>
  );
});

export default Body;
