import { memo } from 'react';

import AgentSelector from '@/routes/(main)/home/features/InputArea/AgentSelector';

const ModelLabel = memo(() => {
  return <AgentSelector />;
});

ModelLabel.displayName = 'ModelLabel';

export default ModelLabel;
