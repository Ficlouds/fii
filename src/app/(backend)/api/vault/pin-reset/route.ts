import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { vaultPins, vaultSessions } from '@/database/schemas';
import { serverDB } from '@/database/server';

const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const generateOTP = () => Math.floor(100_000 + Math.random() * 900_000).toString();

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const userEmail = session.user.email;

  const { action, otp, newPin } = await req.json();

  if (action === 'request_otp') {
    const code = generateOTP();
    otpStore.set(userId, { otp: code, expiresAt: Date.now() + 10 * 60 * 1000 });

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Fi <security@ficlouds.com>',
          to: userEmail,
          subject: 'Fi Vault — PIN Reset Code',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#111;margin-bottom:8px">Fi Vault PIN Reset</h2>
              <p style="color:#555;margin-bottom:24px">Use the code below to reset your vault PIN.</p>
              <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111">${code}</span>
              </div>
              <p style="color:#888;font-size:13px">Expires in 10 minutes. If you did not request this, ignore this email.</p>
            </div>
          `,
        }),
      });
      if (!res.ok) {
        console.error('[Vault PIN Reset] Resend error:', await res.text());
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }
    } catch (e) {
      console.error('[Vault PIN Reset] Email error:', e);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    const [local, domain] = userEmail.split('@');
    const maskedEmail = `${local?.[0] ?? ''}***@${domain}`;
    return NextResponse.json({ success: true, maskedEmail });
  }

  if (action === 'reset') {
    if (!otp || !newPin) {
      return NextResponse.json({ error: 'OTP and new PIN required' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(String(otp))) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 });
    }
    if (!/^\d{4,6}$/.test(String(newPin))) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 });
    }

    const stored = otpStore.get(userId);
    if (!stored) {
      return NextResponse.json({ error: 'No reset requested or code expired' }, { status: 400 });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(userId);
      return NextResponse.json(
        { error: 'Reset code expired. Request a new one.' },
        { status: 400 },
      );
    }
    if (stored.otp !== String(otp)) {
      return NextResponse.json({ error: 'Incorrect code' }, { status: 401 });
    }

    otpStore.delete(userId);
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(String(newPin), 12);

    await serverDB
      .insert(vaultPins)
      .values({ userId, pinHash: hash })
      .onConflictDoUpdate({
        target: vaultPins.userId,
        set: { pinHash: hash, updatedAt: new Date(), failedAttempts: 0, lockedUntil: null },
      });

    await serverDB.delete(vaultSessions).where(eq(vaultSessions.userId, userId));

    return NextResponse.json({ success: true, message: 'PIN reset successfully' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
