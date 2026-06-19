import { type FiAgentConfig } from '@/types/agent';

export interface UpdateAgentResult {
  agent?: FiAgentConfig;
  success: boolean;
}
