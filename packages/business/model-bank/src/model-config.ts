import type { AiFullModelCard } from 'model-bank';
import { loadModels as loadModelBankModels, ModelProvider } from 'model-bank';

interface FiModelConfig {
  models: AiFullModelCard[];
  planCardModels: string[];
  updatedAt?: string;
  version: number;
}

const getDefaultFiModelConfig = (): FiModelConfig => ({
  models: [],
  planCardModels: [],
  version: 1,
});

const loadFiModelConfig = async (): Promise<FiModelConfig> =>
  getDefaultFiModelConfig();

export const loadModels = async () =>
  loadModelBankModels({
    providerLoaders: {
      [ModelProvider.Fi]: loadFiModels,
    },
  });

const loadFiModels = async (): Promise<AiFullModelCard[]> =>
  (await loadFiModelConfig()).models;

export const loadFiPlanCardModels = async (): Promise<string[]> =>
  (await loadFiModelConfig()).planCardModels;
