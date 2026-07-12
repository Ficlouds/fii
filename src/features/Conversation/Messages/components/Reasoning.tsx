import { memo } from 'react';

import Thinking from '@/features/Conversation/components/Thinking';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { messageStateSelectors, useConversationStore } from '../../store';

interface ReasoningProps {
  content?: string;
  duration?: number;
  id: string;
  isMultimodal?: boolean;
}

const Reasoning = memo<ReasoningProps>(({ duration, id }) => {
  const isReasoning = useConversationStore(messageStateSelectors.isMessageInReasoning(id));
  const transitionMode = useUserStore(userGeneralSettingsSelectors.transitionMode);

  // Fi Security: raw reasoning_content is NEVER shown to users.
  // DeepSeek's internal thoughts can contain model identity and system
  // prompt fragments. We show only our custom spinner words instead.
  // See: research doc Section 3 — Option B (hide raw reasoning).

  return (
    <Thinking
      content={undefined}
      duration={duration}
      thinking={isReasoning}
      thinkingAnimated={transitionMode === 'fadeIn' && isReasoning}
    />
  );
});

export default Reasoning;
