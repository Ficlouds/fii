-- Fi Vault Authentication Tables
-- PIN protection + TOTP 2FA for memory vault

-- Vault PINs (bcrypt hashed, never plaintext)
CREATE TABLE IF NOT EXISTS "vault_pins" (
  "user_id"         TEXT PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "pin_hash"        TEXT NOT NULL,
  "created_at"      TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at"      TIMESTAMP DEFAULT NOW() NOT NULL,
  "failed_attempts" INTEGER DEFAULT 0 NOT NULL,
  "locked_until"    TIMESTAMP
);

-- Vault TOTP (encrypted secret for Google/Microsoft Authenticator)
CREATE TABLE IF NOT EXISTS "vault_totp" (
  "user_id"           TEXT PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "encrypted_secret"  TEXT NOT NULL,
  "enabled"           BOOLEAN DEFAULT FALSE NOT NULL,
  "verified_at"       TIMESTAMP,
  "created_at"        TIMESTAMP DEFAULT NOW() NOT NULL,
  "backup_codes"      TEXT
);

-- Vault Sessions (short-lived, 5 min TTL)
CREATE TABLE IF NOT EXISTS "vault_sessions" (
  "id"            TEXT PRIMARY KEY,
  "user_id"       TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at"    TIMESTAMP NOT NULL,
  "totp_verified" BOOLEAN DEFAULT FALSE NOT NULL,
  "created_at"    TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for fast session lookup
CREATE INDEX IF NOT EXISTS "vault_sessions_user_id_idx" ON "vault_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "vault_sessions_expires_at_idx" ON "vault_sessions"("expires_at");
