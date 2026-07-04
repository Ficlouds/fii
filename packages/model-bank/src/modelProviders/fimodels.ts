import type { ModelProviderCard } from '@/types/llm';

const FiModels: ModelProviderCard = {
  chatModels: [],
  description: "Fi's own model infrastructure.",
  id: 'fimodels',
  modelList: { showModelFetcher: false },
  name: 'Fi',
  settings: {
    sdkType: 'openai',
    showApiKey: false,
    showModelFetcher: false,
  },
  showApiKey: false,
  url: '',
};

export default FiModels;
