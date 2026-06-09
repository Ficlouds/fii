import { z } from 'zod';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5679';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

const AUTOMATION_PROMPT = `You are an automation builder. Convert user requests into valid n8n workflow JSON.
Return ONLY valid JSON — no explanation, no markdown, no code blocks.
Use these node types: n8n-nodes-base.scheduleTrigger, n8n-nodes-base.gmail, n8n-nodes-base.slack, n8n-nodes-base.notion, n8n-nodes-base.set
Every workflow needs at least one trigger node.
Node positions: start at x:250, y:300, space 200px apart horizontally.
Return: {"name": "string", "nodes": [], "connections": {}, "settings": {"executionOrder": "v1"}}`;

export const automateRouter = router({
  create: authedProcedure
    .use(serverDatabase)
    .input(z.object({
      prompt: z.string(),
      connectedApps: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { prompt, connectedApps } = input;

      // Step 1: Generate workflow with DeepSeek
      const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 4000,
          messages: [
            { role: 'system', content: AUTOMATION_PROMPT },
            { role: 'user', content: `Connected apps: ${connectedApps?.join(', ') || 'none'}. Build workflow for: ${prompt}` },
          ],
        }),
      });

      const deepseekData = await deepseekRes.json();
      const workflowJSON = deepseekData.choices?.[0]?.message?.content;

      if (!workflowJSON) throw new Error('Failed to generate workflow');

      // Step 2: Parse JSON
      let workflow;
      try {
        workflow = JSON.parse(workflowJSON);
      } catch {
        const match = workflowJSON.match(/\{[\s\S]*\}/);
        if (match) workflow = JSON.parse(match[0]);
        else throw new Error('Invalid workflow JSON');
      }

      // Step 3: Clean and create in n8n
      delete workflow.active;
      if (workflow.nodes) {
        workflow.nodes = workflow.nodes.map((node: any) => {
          if (node.webhookId !== undefined) node.webhookId = String(node.webhookId);
          if (!node.id) node.id = Math.random().toString(36).substr(2, 9);
          return node;
        });
      }

      const n8nRes = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': N8N_API_KEY,
        },
        body: JSON.stringify(workflow),
      });

      const created = await n8nRes.json();
      if (!n8nRes.ok) throw new Error(created.message || 'Failed to create workflow');

      // Step 4: Activate
      await fetch(`${N8N_BASE_URL}/api/v1/workflows/${created.id}/activate`, {
        method: 'POST',
        headers: { 'X-N8N-API-KEY': N8N_API_KEY },
      });

      return {
        success: true,
        workflowId: created.id,
        workflowName: created.name,
        message: `✓ Automation "${created.name}" is now live.`,
      };
    }),

  list: authedProcedure
    .use(serverDatabase)
    .query(async ({ ctx }) => {
      const res = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY },
      });
      const data = await res.json();
      return data.data || [];
    }),
});
