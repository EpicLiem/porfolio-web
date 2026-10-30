import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "portfolio-admin";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const digest = (value: string) => createHash("sha256").update(value).digest();

export function checkAdminPassword(candidate: unknown, password: string | undefined): boolean {
  if (!password || typeof candidate !== "string" || candidate.length > 4096) return false;
  return timingSafeEqual(digest(candidate), digest(password));
}

function signature(payload: string, password: string) {
  return createHmac("sha256", password).update(`portfolio-admin-session:${payload}`).digest("hex");
}

export function createAdminSession(password: string, now = Date.now()): string {
  if (!password) throw new Error("Admin is not configured");
  const payload = `v1.${Math.floor(now / 1000) + ADMIN_SESSION_SECONDS}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${signature(payload, password)}`;
}

export function verifyAdminSession(token: unknown, password: string | undefined, now = Date.now()): boolean {
  if (!password || typeof token !== "string" || token.length > 160) return false;
  const match = /^(v1\.(\d{10,12})\.[a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[2]);
  const seconds = Math.floor(now / 1000);
  if (expires <= seconds || expires > seconds + ADMIN_SESSION_SECONDS) return false;
  return timingSafeEqual(Buffer.from(match[3], "hex"), Buffer.from(signature(match[1], password), "hex"));
}

// This bounds attempts within one server process; deployment-level limits must span instances.
export function createLoginLimiter(limit = 10, windowMs = 15 * 60 * 1000, maxKeys = 1000) {
  const attempts = new Map<string, { count: number; expires: number }>();
  return {
    allow(key: string, now = Date.now()): boolean {
      for (const [ip, record] of attempts) if (record.expires <= now) attempts.delete(ip);
      const record = attempts.get(key);
      if (record) {
        if (record.count >= limit) return false;
        record.count += 1;
        return true;
      }
      if (attempts.size >= maxKeys) return false;
      attempts.set(key, { count: 1, expires: now + windowMs });
      return true;
    },
    clear(key: string) { attempts.delete(key); },
  };
}
