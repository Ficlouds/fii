import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getComposioToken } from '@/services/composio';

export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const appSlug = req.nextUrl.searchParams.get('app');
  if (!appSlug) return NextResponse.json({ error: 'Missing app' }, { status: 400 });
  try {
    const connection = await getComposioToken(session.user.id, appSlug);
    return NextResponse.json({ connection });
  } catch {
    return NextResponse.json({ error: 'Not connected' }, { status: 404 });
  }
};
