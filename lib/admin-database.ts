import { sql } from "@vercel/postgres";
import type { AdminEntry, BlockedIp } from "./admin-service";

type Query = (text: string, values: (string | number)[]) => Promise<{ rows: Record<string, unknown>[] }>;
const query: Query = (text, values) => sql.query(text, values);

export function createAdminDatabase(run: Query = query) {
  return {
    async listEntries(offset: number, limit: number): Promise<AdminEntry[]> {
      const result = await run("SELECT id, name, message, created_at, ip FROM guestbook_entries ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2", [limit, offset]);
      return result.rows.map(row => ({ id: String(row.id), name: String(row.name), message: String(row.message), created_at: new Date(String(row.created_at)).toISOString(), ip: row.ip == null ? null : String(row.ip) }));
    },
    async listBlocked(offset: number, limit: number): Promise<BlockedIp[]> {
      const result = await run("SELECT ip, created_at FROM blacklisted_ips ORDER BY created_at DESC, ip ASC LIMIT $1 OFFSET $2", [limit, offset]);
      return result.rows.map(row => ({ ip: String(row.ip), created_at: new Date(String(row.created_at)).toISOString() }));
    },
    async deleteEntry(id: string): Promise<boolean> {
      const result = await run("DELETE FROM guestbook_entries WHERE id = $1 RETURNING id", [id]);
      return result.rows.length > 0;
    },
    async blockIp(ip: string): Promise<void> {
      await run("INSERT INTO blacklisted_ips (ip) VALUES ($1) ON CONFLICT (ip) DO NOTHING", [ip]);
    },
    async unblockIp(ip: string): Promise<boolean> {
      const result = await run("DELETE FROM blacklisted_ips WHERE ip = $1 RETURNING ip", [ip]);
      return result.rows.length > 0;
    },
  };
}
