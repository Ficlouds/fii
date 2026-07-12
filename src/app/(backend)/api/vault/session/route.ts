import { and, eq, gt } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { vaultSessions } from '@/database/schemas';
import { serverDB } from '@/database/server';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ valid: false }, { status: 401 });

  const sessionId = req.cookies.get('vault_session')?.value;
  if (!sessionId) return NextResponse.json({ valid: false });

  const vaultSession = await serverDB
    .select()
    .from(vaultSessions)
    .where(
      and(
        eq(vaultSessions.id, sessionId),
        eq(vaultSessions.userId, session.user.id),
        gt(vaultSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!vaultSession[0]) return NextResponse.json({ valid: false });

  return NextResponse.json({
    valid: true,
    totpVerified: vaultSession[0].totpVerified,
    expiresAt: vaultSession[0].expiresAt,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

  const sessionId = req.cookies.get('vault_session')?.value;
  if (sessionId) {
    await serverDB
      .delete(vaultSessions)
      .where(and(eq(vaultSessions.id, sessionId), eq(vaultSessions.userId, session.user.id)));
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete('vault_session');
  return res;
}
