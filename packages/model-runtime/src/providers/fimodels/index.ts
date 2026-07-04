import type { ChatModelCard } from '@ficlouds/types';
import { ModelProvider } from 'model-bank';

import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';

/**
 * Fi's single internal model provider.
 *
 * All three tiers (F1.8/F2.7/F3.6) route through this one provider, which
 * points at Fi's own LiteLLM server (not at Groq/DeepSeek/Gemini directly).
 * LiteLLM internally decides which real backend to call. This means the
 * frontend, error messages, and settings UI never see or mention Groq,
 * DeepSeek, or Gemini by name -- only "Fi" -- regardless of which model
 * is actually serving the request.
 */

export interface FiModelsModelCard {
  id: string;
}

export const LobeFiModelsAI = createOpenAICompatibleRuntime({
  baseURL: process.env.DEEPSEEK_PROXY_URL || 'http://127.0.0.1:4000',
  debug: {
    chatCompletion: () => process.env.DEBUG_FIMODELS_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: FiModelsModelCard[] = modelsPage.data;

    return modelList.map((model) => ({
      contextWindowTokens: undefined,
      displayName: undefined,
      enabled: true,
      functionCall: false,
      id: model.id,
      reasoning: false,
      vision: false,
    })) as ChatModelCard[];
  },
  provider: ModelProvider.FiModels,
});
