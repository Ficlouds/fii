import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || 'ak_TFs2fwpnx2uG1MbkmUkk';
const COMPOSIO_BASE = 'https://backend.composio.dev';

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ ok: false });

  const app = req.nextUrl.searchParams.get('app');
  if (!app) return NextResponse.json({ ok: false });

  try {
    // Find and delete any INITIALIZING or INITIATED connections for this app
    const res = await fetch(
      `${COMPOSIO_BASE}/api/v3/connected_accounts?user_id=${session.user.id}&toolkit=${app}&limit=10`,
      { headers: { 'x-api-key': COMPOSIO_API_KEY } }
    );
    const data = await res.json();
    const pending = (data.items || []).filter((item: any) =>
      item.toolkit?.slug === app &&
      ['INITIALIZING', 'INITIATED', 'PENDING'].includes(item.status)
    );
    await Promise.all(pending.map((item: any) =>
      fetch(`${COMPOSIO_BASE}/api/v3/connected_accounts/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': COMPOSIO_API_KEY },
      })
    ));
    return NextResponse.json({ ok: true, revoked: pending.length });
  } catch {
    return NextResponse.json({ ok: false });
  }
};
