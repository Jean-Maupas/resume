import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { JWT_SECRET, ADMIN_PASSWORD_HASH } from '$env/static/private';
import { getDb } from '$db/client';

const COOKIE_NAME = 'admin_session';
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ── Password ─────────────────────────────────────────────────────────────

export async function verifyPassword(plain: string): Promise<boolean> {
  return bcrypt.compare(plain, ADMIN_PASSWORD_HASH);
}

// ── Session lifecycle ─────────────────────────────────────────────────────

export async function createSession(): Promise<string> {
  const sql = getDb();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());

  await sql`
    INSERT INTO auth_sessions (token_hash, expires_at)
    VALUES (${hashToken(token)}, ${expiresAt.toISOString()})
  `;

  // Clean up expired sessions while we're here
  await sql`DELETE FROM auth_sessions WHERE expires_at < NOW()`;

  return token;
}

export async function validateSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
  } catch {
    return false;
  }

  const sql = getDb();
  const rows = await sql`
    SELECT 1 FROM auth_sessions
    WHERE  token_hash = ${hashToken(token)}
    AND    expires_at > NOW()
    LIMIT  1
  `;
  return rows.length > 0;
}

export async function revokeSession(token: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM auth_sessions WHERE token_hash = ${hashToken(token)}`;
}

// ── Cookie helpers ────────────────────────────────────────────────────────

export const SESSION_COOKIE = COOKIE_NAME;

export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: maxAge ?? TOKEN_TTL_SECONDS
  };
}
