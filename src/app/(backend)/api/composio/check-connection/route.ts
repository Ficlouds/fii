import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk';
const COMPOSIO_BASE = 'https://backend.composio.dev';

export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ connected: false }, { status: 401 });

  const app = req.nextUrl.searchParams.get('app');
  const includeInitializing = req.nextUrl.searchParams.get('includeInitializing') === 'true';
  if (!app) return NextResponse.json({ connected: false }, { status: 400 });

  // Only detect connections created after this timestamp (prevents false positives from pre-existing connections)
  const since = req.nextUrl.searchParams.get('since');
  const sinceDate = since ? new Date(parseInt(since)) : null;

  try {
    const res = await fetch(
      `${COMPOSIO_BASE}/api/v3/connected_accounts?user_id=${session.user.id}&toolkit=${app}&status=ACTIVE&limit=10`,
      { headers: { 'x-api-key': COMPOSIO_API_KEY } }
    );
    const data = await res.json();
    // Filter by exact toolkit slug
    const matching = (data.items || []).filter((item: any) => item.toolkit?.slug === app);
    // If since param provided, only count connections created after that time
    const newConnections = sinceDate
      ? matching.filter((item: any) => new Date(item.created_at) > sinceDate)
      : matching;
    const connected = newConnections.length > 0;
    return NextResponse.json({
      connected,
      connectionId: connected ? newConnections[0].id : null
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
};
