import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { Secret, TOTP } from 'otpauth';

import { auth } from '@/auth';
import { vaultSessions, vaultTotp } from '@/database/schemas';
import { serverDB } from '@/database/server';

const APP_NAME = 'Fi by Ficlouds';
const ENC_KEY = (process.env.VAULT_ENCRYPTION_KEY ?? 'fi-vault-default-key-change-me!!')
  .padEnd(32)
  .slice(0, 32);

function encryptSecret(secret: string): string {
  const key = Buffer.from(ENC_KEY, 'utf8');
  const buf = Buffer.from(secret, 'utf8');
  return Buffer.from(buf.map((b, i) => b ^ (key[i % key.length] ?? 0))).toString('hex');
}

function decryptSecret(hex: string): string {
  const key = Buffer.from(ENC_KEY, 'utf8');
  const buf = Buffer.from(hex, 'hex');
  return Buffer.from(buf.map((b, i) => b ^ (key[i % key.length] ?? 0))).toString('utf8');
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;
  const userEmail = session.user.email ?? userId;

  const body = (await req.json()) as { action: string; token?: string };
  const { action, token } = body;

  // ── Status ────────────────────────────────────────────────────────────────
  if (action === 'status') {
    const record = await serverDB
      .select({ enabled: vaultTotp.enabled })
      .from(vaultTotp)
      .where(eq(vaultTotp.userId, userId))
      .limit(1);
    return NextResponse.json({ totpEnabled: record[0]?.enabled ?? false });
  }

  // ── Generate QR code ──────────────────────────────────────────────────────
  if (action === 'generate') {
    const secret = new Secret();
    const totp = new TOTP({ issuer: APP_NAME, label: userEmail, secret });
    const otpauth = totp.toString();
    const QRCode = await import('qrcode');
    const qrDataUrl = await QRCode.default.toDataURL(otpauth);

    await serverDB
      .insert(vaultTotp)
      .values({ userId, encryptedSecret: encryptSecret(secret.base32), enabled: false })
      .onConflictDoUpdate({
        target: vaultTotp.userId,
        set: { encryptedSecret: encryptSecret(secret.base32), enabled: false },
      });

    return NextResponse.json({ secret: secret.base32, qrDataUrl, otpauth });
  }

  // ── Enable TOTP (verify first code after scanning) ────────────────────────
  if (action === 'enable') {
    if (!token || !/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: 'Enter the 6-digit code from your authenticator app' },
        { status: 400 },
      );
    }
    const record = await serverDB
      .select()
      .from(vaultTotp)
      .where(eq(vaultTotp.userId, userId))
      .limit(1);
    if (!record[0]) return NextResponse.json({ error: 'TOTP not set up yet' }, { status: 404 });

    const secret = Secret.fromBase32(decryptSecret(record[0].encryptedSecret));
    const totp = new TOTP({ secret });
    const delta = totp.validate({ token, window: 1 });

    if (delta === null)
      return NextResponse.json({ error: 'Invalid code — try again' }, { status: 401 });

    const backupCodes = Array.from({ length: 8 }, () =>
      randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase(),
    );
    const bcrypt = await import('bcryptjs');
    const hashedCodes = await Promise.all(backupCodes.map((c) => bcrypt.hash(c, 10)));

    await serverDB
      .update(vaultTotp)
      .set({ enabled: true, verifiedAt: new Date(), backupCodes: JSON.stringify(hashedCodes) })
      .where(eq(vaultTotp.userId, userId));

    return NextResponse.json({ success: true, backupCodes });
  }

  // ── Verify TOTP for high-risk action ──────────────────────────────────────
  if (action === 'verify') {
    if (!token || !/^\d{6,8}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }
    const record = await serverDB
      .select()
      .from(vaultTotp)
      .where(eq(vaultTotp.userId, userId))
      .limit(1);
    if (!record[0]?.enabled) {
      return NextResponse.json({ error: 'TOTP not enabled', code: 'NO_TOTP' }, { status: 404 });
    }

    const secret = Secret.fromBase32(decryptSecret(record[0].encryptedSecret));
    const totp = new TOTP({ secret });
    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      // Check backup codes
      const bcrypt = await import('bcryptjs');
      const storedCodes = JSON.parse(record[0].backupCodes ?? '[]') as string[];
      let usedBackup = false;
      for (let i = 0; i < storedCodes.length; i++) {
        const code = storedCodes[i];
        if (code && (await bcrypt.compare(token, code))) {
          storedCodes.splice(i, 1);
          await serverDB
            .update(vaultTotp)
            .set({ backupCodes: JSON.stringify(storedCodes) })
            .where(eq(vaultTotp.userId, userId));
          usedBackup = true;
          break;
        }
      }
      if (!usedBackup) {
        return NextResponse.json({ error: 'Invalid code', code: 'INVALID_TOTP' }, { status: 401 });
      }
    }

    // Mark vault session as TOTP verified
    const vaultSessionId = req.cookies.get('vault_session')?.value;
    if (vaultSessionId) {
      await serverDB
        .update(vaultSessions)
        .set({ totpVerified: true })
        .where(eq(vaultSessions.id, vaultSessionId));
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
