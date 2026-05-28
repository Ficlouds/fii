import { Center, Empty, Flexbox } from '@lobehub/ui';
import { FileText } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';

import { lambdaQuery } from '@/libs/trpc/client';

import SkeletonLoading from '../Loading';
import ChunkItem from './ChunkItem';

interface ChunkListProps {
  fileId: string;
}
const ChunkList = memo<ChunkListProps>(({ fileId }) => {
  const { t } = useTranslation('file');
  const { data, isError, isFetchingNextPage, isLoading, fetchNextPage, hasNextPage } =
    lambdaQuery.chunk.getChunksByFileId.useInfiniteQuery(
      { id: fileId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const dataSource = data?.pages.flatMap((page) => page.items) || [];

  if (isLoading) return <SkeletonLoading />;

  if (isError) {
    return (
      <Center flex={1} padding={24}>
        <Empty description={t('chunkDrawer.error')} icon={FileText} />
      </Center>
    );
  }

  if (dataSource.length === 0) {
    return (
      <Center flex={1} padding={24}>
        <Empty description={t('chunkDrawer.empty')} icon={FileText} />
      </Center>
    );
  }

  return (
    <Flexbox flex={1} style={{ minHeight: 0 }}>
      <Virtuoso
        data={dataSource}
        style={{ height: '100%' }}
        endReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        itemContent={(index, item) => (
          <Flexbox key={item.id} paddingInline={12}>
            <ChunkItem {...item} index={index} />
          </Flexbox>
        )}
      />
    </Flexbox>
  );
});

export default ChunkList;
