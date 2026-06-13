import { type NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/app/(backend)/middleware/auth';

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5679';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// System prompt for Fi F3.6 (V4 Pro) to build n8n workflows
const AUTOMATION_SYSTEM_PROMPT = `You are Fi, an automation builder. Your job is to convert user requests into valid n8n workflow JSON.

RULES:
1. Return ONLY valid JSON — no explanation, no markdown, no code blocks
2. Use only these node types: n8n-nodes-base.scheduleTrigger, n8n-nodes-base.gmail, n8n-nodes-base.slack, n8n-nodes-base.notion, n8n-nodes-base.httpRequest, n8n-nodes-base.set, n8n-nodes-base.if
3. Every workflow needs at least one trigger node
4. Node positions must be spaced 200px apart horizontally
5. Always set active: true

Return this exact JSON structure:
{
  "name": "workflow name",
  "active": true,
  "nodes": [...],
  "connections": {...},
  "settings": { "executionOrder": "v1" }
}`;

export const POST = checkAuth(async (req: NextRequest, { userId }) => {
  try {
    const { prompt, connectedApps } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    // Step 1: Use DeepSeek V4 Pro (F3.6) to generate workflow JSON
    const deepseekRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: AUTOMATION_SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `User's connected apps: ${connectedApps?.join(', ') || 'none'}
            
Build an n8n workflow for: ${prompt}` 
          },
        ],
      }),
    });

    if (!deepseekRes.ok) {
      throw new Error('Failed to generate workflow');
    }

    const deepseekData = await deepseekRes.json();
    const workflowJSON = deepseekData.choices?.[0]?.message?.content;

    if (!workflowJSON) {
      throw new Error('No workflow generated');
    }

    // Step 2: Parse the JSON
    let workflow;
    try {
      workflow = JSON.parse(workflowJSON);
    } catch {
      // Try to extract JSON from response if wrapped in text
      const match = workflowJSON.match(/\{[\s\S]*\}/);
      if (match) {
        workflow = JSON.parse(match[0]);
      } else {
        throw new Error('Invalid workflow JSON generated');
      }
    }

    // Step 3: Add userId tag for identification
    workflow.tags = [{ name: `user:${userId}` }];

    // Step 4: Create workflow in n8n
    const n8nRes = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      body: JSON.stringify(workflow),
    });

    if (!n8nRes.ok) {
      const error = await n8nRes.json();
      throw new Error(error.message || 'Failed to create workflow in n8n');
    }

    const createdWorkflow = await n8nRes.json();

    // Step 5: Activate the workflow
    await fetch(`${N8N_BASE_URL}/api/v1/workflows/${createdWorkflow.id}/activate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });

    return NextResponse.json({
      success: true,
      workflowId: createdWorkflow.id,
      workflowName: createdWorkflow.name,
      message: `Automation "${createdWorkflow.name}" created and activated successfully.`,
    });

  } catch (error: any) {
    console.error('Automate API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create automation' },
      { status: 500 }
    );
  }
});
