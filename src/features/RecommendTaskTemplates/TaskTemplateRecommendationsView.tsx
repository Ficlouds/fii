import { Flexbox, Grid } from '@lobehub/ui';
import { memo } from 'react';

import { BriefCardSkeleton } from '@/features/DailyBrief/BriefCardSkeleton';

import { TaskTemplateCard } from './TaskTemplateCard';
import type { TaskTemplateRecommendationsUIState } from './useTaskTemplateRecommendationsUI';

export interface TaskTemplateRecommendationsViewProps {
  state: TaskTemplateRecommendationsUIState;
  variant?: 'compact' | 'default';
}

export const TaskTemplateRecommendationsView = memo<TaskTemplateRecommendationsViewProps>(
  ({ state, variant = 'default' }) => {
    if (state.mode === 'hidden') return null;
    if (state.mode === 'skeleton') {
      return (
        <Flexbox gap={8}>
          <BriefCardSkeleton />
          <BriefCardSkeleton />
        </Flexbox>
      );
    }

    if (variant === 'compact') {
      return (
        <Grid gap={8} maxItemWidth={340} style={{ width: '100%' }}>
          {state.templates.map((tmpl, index) => (
            <TaskTemplateCard
              key={tmpl.id}
              position={index}
              recommendationBatchId={state.recommendationBatchId}
              template={tmpl}
              userInterestCount={state.userInterestCount}
              variant={'compact'}
              onCreated={state.onCreated}
              onDismiss={state.onDismiss}
            />
          ))}
        </Grid>
      );
    }

    return (
      <Flexbox gap={8}>
        {state.templates.map((tmpl, index) => (
          <TaskTemplateCard
            key={tmpl.id}
            position={index}
            recommendationBatchId={state.recommendationBatchId}
            template={tmpl}
            userInterestCount={state.userInterestCount}
            onCreated={state.onCreated}
            onDismiss={state.onDismiss}
          />
        ))}
      </Flexbox>
    );
  },
);

TaskTemplateRecommendationsView.displayName = 'TaskTemplateRecommendationsView';
