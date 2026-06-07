import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk';
const COMPOSIO_BASE = 'https://backend.composio.dev';

export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ connected: false }, { status: 401 });

  const app = req.nextUrl.searchParams.get('app');
  if (!app) return NextResponse.json({ connected: false }, { status: 400 });

  try {
    const res = await fetch(
      `${COMPOSIO_BASE}/api/v3/connected_accounts?user_id=${session.user.id}&toolkit=${app}&status=ACTIVE&limit=10`,
      { headers: { 'x-api-key': COMPOSIO_API_KEY } }
    );
    const data = await res.json();
    // Filter by exact toolkit slug to prevent cross-app false positives
    const matching = (data.items || []).filter((item: any) => item.toolkit?.slug === app);
    const connected = matching.length > 0;
    return NextResponse.json({
      connected,
      connectionId: connected ? matching[0].id : null
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
};
