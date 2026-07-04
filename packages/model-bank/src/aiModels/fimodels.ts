import type { AIChatModelCard } from '../types/aiModel';

// Models routed through Fi's own LiteLLM server. Model names here must
// match LiteLLM's config.yaml model_name entries exactly.
const fiModelsChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: false,
      vision: true,
    },
    contextWindowTokens: 10_000_000,
    description: 'Fi F1.8 -- fast, everyday chat, simple images.',
    displayName: 'F1.8',
    enabled: true,
    id: 'llama-4-scout',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_048_576,
    description: 'Fi F2.7 -- balanced, everyday work tasks.',
    displayName: 'F2.7',
    enabled: true,
    id: 'deepseek-v4-flash',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
    },
    contextWindowTokens: 1_048_576,
    description: 'Fi F3.6 -- deep reasoning, complex tasks.',
    displayName: 'F3.6',
    enabled: true,
    id: 'deepseek-v4-pro',
    type: 'chat',
  },
];

export default fiModelsChatModels;
