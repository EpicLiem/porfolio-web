import { isIP } from "node:net";
import type { GuestbookEntry } from "./forms-service";

export type AdminEntry = GuestbookEntry & { ip: string | null };
export type BlockedIp = { ip: string; created_at: string };
export type AdminResult = { success: boolean; message: string; unauthorized?: boolean };
export type AdminDashboardResult = {
  success: true; entries: AdminEntry[]; blockedIps: BlockedIp[];
  page: number; hasMore: boolean; blockedPage: number; hasMoreBlocked: boolean;
} | { success: false; message: string; unauthorized?: boolean };
export const ADMIN_PAGE_SIZE = 50;
export type AdminDependencies = {
  authorized: () => Promise<boolean>;
  databaseConfigured: boolean;
  listEntries: (offset: number, limit: number) => Promise<AdminEntry[]>;
  listBlocked: (offset: number, limit: number) => Promise<BlockedIp[]>;
  deleteEntry: (id: string) => Promise<boolean>;
  blockIp: (ip: string) => Promise<void>;
  unblockIp: (ip: string) => Promise<boolean>;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validPage = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 1 && value <= 1_000_000;

export function createAdminService(deps: AdminDependencies) {
  async function authorize(): Promise<AdminResult | null> {
    if (!await deps.authorized()) return { success: false, unauthorized: true, message: "Sign in to manage the guestbook." };
    if (!deps.databaseConfigured) return { success: false, message: "The guestbook database is not configured." };
    return null;
  }
  return {
    async dashboard(page: unknown = 1, blockedPage: unknown = 1): Promise<AdminDashboardResult> {
      const failure = await authorize();
      if (failure) return { ...failure, success: false };
      if (!validPage(page) || !validPage(blockedPage)) return { success: false, message: "Choose a valid page." };
      try {
        const [entries, blockedIps] = await Promise.all([
          deps.listEntries((page - 1) * ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZE + 1),
          deps.listBlocked((blockedPage - 1) * ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZE + 1),
        ]);
        return {
          success: true, entries: entries.slice(0, ADMIN_PAGE_SIZE), blockedIps: blockedIps.slice(0, ADMIN_PAGE_SIZE),
          page, hasMore: entries.length > ADMIN_PAGE_SIZE, blockedPage, hasMoreBlocked: blockedIps.length > ADMIN_PAGE_SIZE,
        };
      } catch { return { success: false, message: "The guestbook administration data could not be loaded. Try refreshing." }; }
    },
    async delete(data: FormData): Promise<AdminResult> {
      const failure = await authorize();
      if (failure) return failure;
      const id = data.get("id");
      if (typeof id !== "string" || !uuid.test(id)) return { success: false, message: "Choose a valid entry." };
      try {
        return await deps.deleteEntry(id)
          ? { success: true, message: "Entry deleted." }
          : { success: false, message: "That entry no longer exists. Refresh the list." };
      } catch { return { success: false, message: "The entry could not be deleted. Refresh before trying again." }; }
    },
    async block(data: FormData): Promise<AdminResult> {
      const failure = await authorize();
      if (failure) return failure;
      const ip = data.get("ip");
      if (typeof ip !== "string" || !isIP(ip)) return { success: false, message: "Enter a valid IPv4 or IPv6 address." };
      try { await deps.blockIp(ip); return { success: true, message: "IP address blocked." }; }
      catch { return { success: false, message: "The IP address could not be blocked. Refresh before trying again." }; }
    },
    async unblock(data: FormData): Promise<AdminResult> {
      const failure = await authorize();
      if (failure) return failure;
      const ip = data.get("ip");
      if (typeof ip !== "string" || !isIP(ip)) return { success: false, message: "Choose a valid IP address." };
      try {
        return await deps.unblockIp(ip)
          ? { success: true, message: "IP address unblocked." }
          : { success: false, message: "That IP address is no longer blocked. Refresh the list." };
      } catch { return { success: false, message: "The IP address could not be unblocked. Refresh before trying again." }; }
    },
  };
}
