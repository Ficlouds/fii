import { ActionIcon, DropdownMenu, Flexbox } from '@lobehub/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import InlineRename from '@/components/InlineRename';
import TaskStatusIcon from '@/features/AgentTasks/features/TaskStatusIcon';
import NavItem from '@/features/NavPanel/components/NavItem';
import { usePrefetchAgent } from '@/hooks/usePrefetchAgent';
import { usePrefetchPage } from '@/hooks/usePrefetchPage';
import { type RecentItem } from '@/server/routers/lambda/recent';

import { useRecentItemDropdownMenu } from './useDropdownMenu';

const RecentListItem = memo<RecentItem>((item) => {
  const { title, type, agentId, id, status } = item;
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const prefetchAgent = usePrefetchAgent();
  const prefetchPage = usePrefetchPage();

  const toggleEditing = useCallback((visible?: boolean) => {
    setEditing(!!visible);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    switch (type) {
      case 'topic':
      case 'task': {
        if (agentId) prefetchAgent(agentId);
        break;
      }
      case 'document': {
        prefetchPage(id);
        break;
      }
    }
  }, [type, agentId, id, prefetchAgent, prefetchPage]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const { dropdownMenu, handleRename } = useRecentItemDropdownMenu(item, toggleEditing);

  return (
    <Flexbox
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavItem
        contextMenuItems={dropdownMenu}
        disabled={editing}
        title={title}
        icon={type === 'task' ? <TaskStatusIcon size={16} status={status ?? 'backlog'} /> : undefined}
        actions={
          hovered ? (
            <DropdownMenu items={dropdownMenu()} nativeButton={false}>
              <ActionIcon
                icon={MoreHorizontalIcon}
                size={'small'}
                style={{ flex: 'none', opacity: 1 }}
              />
            </DropdownMenu>
          ) : undefined
        }
      />
      <InlineRename
        open={editing}
        title={title}
        onOpenChange={(open) => toggleEditing(open)}
        onSave={handleRename}
      />
    </Flexbox>
  );
});

export default RecentListItem;
