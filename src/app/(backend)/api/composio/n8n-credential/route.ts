import { type NextRequest, NextResponse } from 'next/server';

import { getComposioToken } from '@/services/composio';

const N8N_SECRET = process.env.N8N_API_KEY || '';

export const GET = async (req: NextRequest) => {
  // Verify request is from n8n using shared secret
  const authHeader = req.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${N8N_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = req.nextUrl.searchParams.get('userId');
  const appSlug = req.nextUrl.searchParams.get('app');
  if (!userId || !appSlug) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  try {
    const connection = await getComposioToken(userId, appSlug);
    return NextResponse.json({ connection });
  } catch {
    return NextResponse.json({ error: 'Not connected' }, { status: 404 });
  }
};
