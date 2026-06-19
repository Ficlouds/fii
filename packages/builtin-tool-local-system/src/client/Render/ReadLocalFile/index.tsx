import { useToolRenderCapabilities } from '@ficlouds/shared-tool-ui';
import type { ReadFileState } from '@ficlouds/tool-runtime';
import type { BuiltinRenderProps } from '@ficlouds/types';
import { memo } from 'react';

import ReadFileSkeleton from './ReadFileSkeleton';
import ReadFileView from './ReadFileView';

const ReadFileQuery = memo<BuiltinRenderProps<{ path: string }, ReadFileState>>(
  ({ args, pluginState, messageId }) => {
    const { isLoading } = useToolRenderCapabilities();
    const loading = isLoading?.(messageId);

    if (loading) {
      return <ReadFileSkeleton />;
    }

    if (!args?.path || !pluginState) return null;

    return <ReadFileView {...pluginState} path={args.path} />;
  },
);

export default ReadFileQuery;
