import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getComposioAuthUrl } from '@/services/composio';

export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appName = req.nextUrl.searchParams.get('app');
  if (!appName) return NextResponse.json({ error: 'Missing app' }, { status: 400 });

  try {
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3010'}/connect?oauth_success=${appName}`;
    const url = await getComposioAuthUrl(appName, session.user.id, redirectUrl);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: 'Failed to get auth URL' }, { status: 500 });
  }
};
