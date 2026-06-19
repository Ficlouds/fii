import type { ModelProviderCard } from '@/types/llm';

const Fi: ModelProviderCard = {
  chatModels: [],
  description:
    'Fi Cloud uses official APIs to access AI models and measures usage with Credits tied to model tokens.',
  enabled: true,
  id: 'lobehub',
  modelsUrl: 'https://ficlouds.com/zh/docs/usage/subscription/model-pricing',
  name: 'Fi',
  settings: {
    modelEditable: false,
    showAddNewModel: false,
    showModelFetcher: false,
  },
  showConfig: false,
  url: 'https://ficlouds.com',
};

export default Fi;

export const planCardModels = [
  'deepseek-v4-pro',
  'claude-sonnet-4-6',
  'gemini-3.1-pro-preview',
  'gpt-5.5',
];
