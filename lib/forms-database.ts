import { sql } from "@vercel/postgres";
import type { GuestMessage, GuestbookEntry } from "./forms-service";

export type DatabaseClient = {
  query: (text: string, values?: string[]) => Promise<{ rows: Record<string, unknown>[] }>;
  release: () => void;
};
export async function insertGuestbookEntry(entry: GuestMessage, ip: string, connect: () => Promise<DatabaseClient> = () => sql.connect()): Promise<"saved" | "blocked" | "limited"> {
  const client = await connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '10s'");
    // A separate lock statement gives the following reads a fresh READ COMMITTED snapshot.
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`guestbook:${ip}`]);
    const blocked = await client.query("SELECT ip FROM blacklisted_ips WHERE ip = $1 LIMIT 1", [ip]);
    if (blocked.rows.length) { await client.query("ROLLBACK"); return "blocked"; }
    const recent = await client.query("SELECT id FROM guestbook_entries WHERE ip = $1 AND created_at > NOW() - INTERVAL '1 minute' LIMIT 1", [ip]);
    if (recent.rows.length) { await client.query("ROLLBACK"); return "limited"; }
    await client.query("INSERT INTO guestbook_entries (name, message, ip) VALUES ($1, $2, $3)", [entry.name, entry.message, ip]);
    await client.query("COMMIT");
    return "saved";
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { client.release(); }
}

export async function listGuestbookEntries(): Promise<GuestbookEntry[]> {
  const result = await sql`SELECT id, name, message, created_at FROM guestbook_entries ORDER BY created_at DESC, id DESC LIMIT 50`;
  return result.rows.map(row => ({ id: String(row.id), name: row.name, message: row.message, created_at: new Date(row.created_at).toISOString() }));
}
