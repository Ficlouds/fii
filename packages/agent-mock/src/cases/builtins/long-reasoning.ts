import { defineCase, llmStep } from '../../builders/defineCase';

export const longReasoning = defineCase({
  id: 'long-reasoning',
  name: 'Long reasoning',
  description: '5000 character reasoning before short answer',
  tags: ['reasoning', 'builtin'],
  steps: [
    llmStep({
      reasoning: 'thinking'.repeat(625),
      text: 'In summary, the conclusion is: A.',
      durationMs: 6000,
    }),
  ],
});
