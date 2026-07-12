import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { vaultPins, vaultSessions } from '@/database/schemas';
import { serverDB } from '@/database/server';

const SALT_ROUNDS = 12;
const SESSION_DURATION_MS = 5 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const { action, pin } = await req.json();

  if (action === 'status') {
    const record = await serverDB
      .select({ userId: vaultPins.userId })
      .from(vaultPins)
      .where(eq(vaultPins.userId, userId))
      .limit(1);
    return NextResponse.json({ hasPin: record.length > 0 });
  }

  if (!pin || typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
  }

  if (action === 'setup') {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(pin, SALT_ROUNDS);
    await serverDB
      .insert(vaultPins)
      .values({ userId, pinHash: hash })
      .onConflictDoUpdate({
        target: vaultPins.userId,
        set: { pinHash: hash, updatedAt: new Date(), failedAttempts: 0, lockedUntil: null },
      });
    return NextResponse.json({ success: true });
  }

  if (action === 'verify') {
    const record = await serverDB
      .select()
      .from(vaultPins)
      .where(eq(vaultPins.userId, userId))
      .limit(1);

    if (!record[0]) {
      return NextResponse.json({ error: 'PIN not set', code: 'NO_PIN' }, { status: 404 });
    }

    const pinRecord = record[0];

    if (pinRecord.lockedUntil && new Date() < pinRecord.lockedUntil) {
      const mins = Math.ceil((pinRecord.lockedUntil.getTime() - Date.now()) / 60_000);
      return NextResponse.json(
        { error: `Vault locked. Try again in ${mins} minutes.`, code: 'LOCKED' },
        { status: 429 },
      );
    }

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(pin, pinRecord.pinHash);

    if (!isValid) {
      const newAttempts = (pinRecord.failedAttempts || 0) + 1;
      const locked = newAttempts >= MAX_FAILED_ATTEMPTS;
      await serverDB
        .update(vaultPins)
        .set({
          failedAttempts: newAttempts,
          lockedUntil: locked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        })
        .where(eq(vaultPins.userId, userId));

      return NextResponse.json(
        {
          error: locked
            ? 'Too many attempts. Vault locked for 15 minutes.'
            : `Wrong PIN. ${MAX_FAILED_ATTEMPTS - newAttempts} ${MAX_FAILED_ATTEMPTS - newAttempts === 1 ? 'attempt' : 'attempts'} left before lockout.`,
          code: 'INVALID_PIN',
          attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
        },
        { status: 401 },
      );
    }

    await serverDB
      .update(vaultPins)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(vaultPins.userId, userId));

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await serverDB.insert(vaultSessions).values({
      id: sessionId,
      userId,
      expiresAt,
      totpVerified: false,
    });

    const res = NextResponse.json({ success: true, sessionId, expiresAt });
    res.cookies.set('vault_session', sessionId, {
      expires: expiresAt,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
