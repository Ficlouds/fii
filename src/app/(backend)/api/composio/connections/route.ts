import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getComposioConnections } from '@/services/composio';

export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const connections = await getComposioConnections(session.user.id);
    return NextResponse.json({ connections });
  } catch {
    return NextResponse.json({ error: 'Failed to get connections' }, { status: 500 });
  }
};
