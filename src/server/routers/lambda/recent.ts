import { z } from 'zod';

import { KnowledgeRepo } from '@/database/repositories/knowledge';
import { TaskModel } from '@/database/models/task';
import { TopicModel } from '@/database/models/topic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

export interface RecentItem {
  icon: string;
  id: string;
  routePath: string;
  title: string;
  type: 'topic' | 'document' | 'file' | 'task';
  updatedAt: Date;
}

const recentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;
  return opts.next({
    ctx: {
      knowledgeRepo: new KnowledgeRepo(ctx.serverDB, ctx.userId),
      taskModel: new TaskModel(ctx.serverDB, ctx.userId),
      topicModel: new TopicModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const recentRouter = router({
  getAll: recentProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }): Promise<RecentItem[]> => {
      const limit = input?.limit ?? 10;

      // Fetch all 4 types in parallel
      const [topics, knowledgeItems, taskResult] = await Promise.all([
        ctx.topicModel.queryRecent(limit),
        ctx.knowledgeRepo.queryRecent(limit * 3), // query more since we filter
        ctx.taskModel.list({ limit }).catch(() => ({ tasks: [], total: 0 })),
      ]);

      const items: RecentItem[] = [];

      // Map topics
      for (const topic of topics) {
        const routePath =
          topic.type === 'group' && topic.groupId
            ? `/group/${topic.groupId}?topic=${topic.id}`
            : `/agent/${topic.agentId}?topic=${topic.id}`;

        items.push({
          icon: 'topic',
          id: topic.id,
          routePath,
          title: topic.title || 'Untitled Topic',
          type: 'topic',
          updatedAt: topic.updatedAt,
        });
      }

      // Map documents (pages)
      const pages = knowledgeItems
        .filter((item) => item.sourceType === 'document' && item.fileType !== 'custom/folder')
        .slice(0, limit);

      for (const page of pages) {
        items.push({
          icon: 'document',
          id: page.id,
          routePath: `/page/${page.id}`,
          title: page.name || 'Untitled Document',
          type: 'document',
          updatedAt: page.updatedAt,
        });
      }

      // Map files
      const files = knowledgeItems
        .filter((item) => item.sourceType === 'file' && item.fileType !== 'custom/document')
        .slice(0, limit);

      for (const file of files) {
        items.push({
          icon: 'file',
          id: file.id,
          routePath: `/resource?file=${file.id}`,
          title: file.name || 'Untitled File',
          type: 'file',
          updatedAt: file.updatedAt,
        });
      }

      // Map tasks
      for (const task of taskResult.tasks) {
        items.push({
          icon: 'task',
          id: task.id,
          routePath: `/agent/${task.assigneeAgentId}`,
          title: task.name || task.instruction || 'Untitled Task',
          type: 'task',
          updatedAt: task.updatedAt,
        });
      }

      // Sort by updatedAt desc and limit
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return items.slice(0, limit);
    }),
});

export type RecentRouter = typeof recentRouter;
