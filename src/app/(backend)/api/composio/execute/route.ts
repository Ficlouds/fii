import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk';
const COMPOSIO_BASE = 'https://backend.composio.dev';

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { action, params } = await req.json();
  if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });
  const res = await fetch(`${COMPOSIO_BASE}/api/v3/actions/${action}/execute`, {
    body: JSON.stringify({ input: params || {}, user_id: session.user.id }),
    headers: { 'x-api-key': COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const data = await res.json();
  return NextResponse.json(data);
};
