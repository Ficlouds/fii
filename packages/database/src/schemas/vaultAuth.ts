import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './user';

// ── Vault PIN ─────────────────────────────────────────────────────────────────
// Stores bcrypt-hashed PIN for memory vault access
// PIN is NEVER stored in plaintext
export const vaultPins = pgTable('vault_pins', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  pinHash: text('pin_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Failed attempt tracking (lockout after 5 failures)
  failedAttempts: integer('failed_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until'),
});

// ── Vault TOTP ────────────────────────────────────────────────────────────────
// Stores encrypted TOTP secret for high-risk vault actions
// Used with Google Authenticator / Microsoft Authenticator
export const vaultTotp = pgTable('vault_totp', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  encryptedSecret: text('encrypted_secret').notNull(),
  enabled: boolean('enabled').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Backup codes (JSON array of hashed codes)
  backupCodes: text('backup_codes'),
});

// ── Vault Sessions ────────────────────────────────────────────────────────────
// Short-lived session tokens after PIN verification (5 min TTL)
export const vaultSessions = pgTable('vault_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  totpVerified: boolean('totp_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type VaultPin = typeof vaultPins.$inferSelect;
export type VaultTotp = typeof vaultTotp.$inferSelect;
export type VaultSession = typeof vaultSessions.$inferSelect;
