"use server";

import { headers } from "next/headers";
import { isIP } from "node:net";
import { Resend } from "resend";
import { createFormsService, type FormResult } from "@/lib/forms-service";
import { insertGuestbookEntry, listGuestbookEntries } from "@/lib/forms-database";
import { moderateContent } from "@/lib/moderation";

function service() {
  return createFormsService({
    contactConfigured: Boolean(process.env.RESEND_API_KEY),
    databaseConfigured: Boolean(process.env.POSTGRES_URL),
    moderationConfigured: Boolean(process.env.GROQ_API_KEY),
    async send({ name, email, message }) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL || "liem@epicliem.com"],
        replyTo: email,
        subject: `New Contact Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
      if (result.error || !result.data?.id) throw new Error("Email delivery not confirmed");
    },
    moderate: moderateContent,
    insert: insertGuestbookEntry,
    list: listGuestbookEntries,
  });
}

export async function sendContactMessage(_previous: FormResult | null, data: FormData): Promise<FormResult> {
  return service().contact(data);
}

export async function addGuestbookEntry(_previous: FormResult | null, data: FormData): Promise<FormResult> {
  const head = await headers();
  // Only trust forwarding headers when the deployment proxy overwrites them.
  const forwarded = process.env.VERCEL === "1" ? head.get("x-vercel-forwarded-for") : process.env.FORMS_TRUST_PROXY === "true" ? head.get("x-forwarded-for") : null;
  const ip = forwarded?.split(",")[0]?.trim();
  return service().add(data, ip && isIP(ip) ? ip : null);
}

export async function getGuestbookEntries() {
  return service().list();
}
