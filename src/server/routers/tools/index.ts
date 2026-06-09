import { publicProcedure, router } from '@/libs/trpc/lambda';

import { automateRouter } from './automate';
import { klavisRouter } from './klavis';
import { marketRouter } from './market';
import { mcpRouter } from './mcp';
import { searchRouter } from './search';

export const toolsRouter = router({
  automate: automateRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  klavis: klavisRouter,
  market: marketRouter,
  mcp: mcpRouter,
  search: searchRouter,
});

export type ToolsRouter = typeof toolsRouter;
