import { z } from "zod";

export type FormResult = { success: boolean; message: string; errors?: Partial<Record<"name" | "email" | "message", string[]>> };
export type GuestbookEntry = { id: string; name: string; message: string; created_at: string };
export type GuestbookResult = { success: true; entries: GuestbookEntry[] } | { success: false; message: string };
export type ModerationResult = { status: "safe" | "rejected" | "unavailable" };
export type ContactMessage = { name: string; email: string; message: string };
export type GuestMessage = Omit<ContactMessage, "email">;
export type FormsDependencies = {
  contactConfigured: boolean;
  databaseConfigured: boolean;
  moderationConfigured: boolean;
  send: (message: ContactMessage) => Promise<void>;
  moderate: (name: string, message: string) => Promise<ModerationResult>;
  insert: (entry: GuestMessage, ip: string) => Promise<"saved" | "blocked" | "limited">;
  list: () => Promise<GuestbookEntry[]>;
};
const name = z.string().trim().min(1, "Enter your name.").max(100, "Use 100 characters or fewer.").refine(value => !/[\r\n\x00-\x1f\x7f]/.test(value), "Use a single line for your name.");
const guestSchema = z.object({ name, message: z.string().trim().min(1, "Enter a message.").max(500, "Use 500 characters or fewer.") });
const contactSchema = guestSchema.extend({ email: z.string().trim().max(254).email("Enter a valid email address."), message: z.string().trim().min(1, "Enter a message.").max(10000, "Use 10,000 characters or fewer.") });
const fail = (message: string): FormResult => ({ success: false, message });

export function createFormsService(deps: FormsDependencies) {
  return {
    async contact(data: FormData): Promise<FormResult> {
      const parsed = contactSchema.safeParse({ name: data.get("name"), email: data.get("email"), message: data.get("message") });
      if (!parsed.success) return { ...fail("Please check the fields below."), errors: parsed.error.flatten().fieldErrors };
      if (!deps.contactConfigured) return fail("The contact form is not configured. Please email liem@epicliem.com instead.");
      try {
        await deps.send(parsed.data);
        return { success: true, message: "Your message was sent. Thank you!" };
      } catch {
        return fail("We couldn't confirm your message was sent. Your text is still here; you can retry or email liem@epicliem.com.");
      }
    },
    async add(data: FormData, ip: string | null): Promise<FormResult> {
      const parsed = guestSchema.safeParse({ name: data.get("name"), message: data.get("message") });
      if (!parsed.success) return { ...fail("Please check the fields below."), errors: parsed.error.flatten().fieldErrors };
      if (!deps.databaseConfigured || !deps.moderationConfigured) return fail("Guestbook signing is not configured yet. Please try again later.");
      if (!ip) return fail("Guestbook signing is temporarily unavailable. Please try again later.");
      try {
        const moderation = await deps.moderate(parsed.data.name, parsed.data.message);
        if (moderation.status === "unavailable") return fail("The moderation service is unavailable. Your entry has not been posted.");
        if (moderation.status === "rejected") return fail("Your entry couldn't be published under the guestbook's moderation rules. Please revise it.");
        const result = await deps.insert(parsed.data, ip);
        if (result === "blocked") return fail("Posting is not available from this connection.");
        if (result === "limited") return fail("Please wait one minute between guestbook entries.");
        return { success: true, message: "Your entry was posted. Thank you for signing!" };
      } catch {
        return fail("We couldn't confirm your entry was saved. Refresh the guestbook before trying again.");
      }
    },
    async list(): Promise<GuestbookResult> {
      if (!deps.databaseConfigured) return { success: false, message: "The guestbook is not configured yet." };
      try { return { success: true, entries: await deps.list() }; }
      catch { return { success: false, message: "The guestbook couldn't be loaded. Please try refreshing." }; }
    },
  };
}
