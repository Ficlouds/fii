import { type NextRequest, NextResponse } from 'next/server';

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5679';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

export const POST = async (req: NextRequest) => {
  try {
    const { prompt, connectedApps } = await req.json();

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
          { 
            role: 'system', 
            content: 'You are an automation builder. Convert user requests into valid n8n workflow JSON. Return ONLY valid JSON with no explanation, no markdown, no code blocks. Structure: {"name": "string", "active": true, "nodes": [], "connections": {}, "settings": {"executionOrder": "v1"}}'
          },
          { 
            role: 'user', 
            content: `Connected apps: ${connectedApps?.join(', ') || 'none'}. Build n8n workflow for: ${prompt}` 
          },
        ],
      }),
    });

    const deepseekData = await deepseekRes.json();
    const workflowJSON = deepseekData.choices?.[0]?.message?.content;

    if (!workflowJSON) {
      return NextResponse.json({ error: 'No workflow generated', raw: deepseekData }, { status: 500 });
    }

    let workflow;
    try {
      workflow = JSON.parse(workflowJSON);
    } catch {
      const match = workflowJSON.match(/\{[\s\S]*\}/);
      if (match) {
        workflow = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: 'Invalid JSON', raw: workflowJSON }, { status: 500 });
      }
    }

    const n8nRes = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
      body: JSON.stringify(workflow),
    });

    const createdWorkflow = await n8nRes.json();

    if (!n8nRes.ok) {
      return NextResponse.json({ error: 'n8n error', details: createdWorkflow }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      workflowId: createdWorkflow.id,
      workflowName: createdWorkflow.name,
      message: `Automation "${createdWorkflow.name}" created successfully.`,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
