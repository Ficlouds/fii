import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { disconnectComposioApp } from '@/services/composio';

export const DELETE = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const connectionId = req.nextUrl.searchParams.get('connectionId');
  if (!connectionId) return NextResponse.json({ error: 'Missing connectionId' }, { status: 400 });

  try {
    await disconnectComposioApp(connectionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
};
