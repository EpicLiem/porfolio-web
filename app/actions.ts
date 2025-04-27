'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { moderateContent } from "@/lib/moderation";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY);

// Define a schema for validation using Zod
const ContactFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
});

export interface ContactFormState {
  message: string;
  error?: string;
  success: boolean;
}

export async function sendContactMessage(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  'use server';

  console.log('Server action received form data:', formData);

  // Validate form data
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Validation failed.',
      error: JSON.stringify(validatedFields.error.flatten().fieldErrors), // Send errors back
      success: false,
    };
  }

  const { name, email, message } = validatedFields.data;

  // Ensure API key is set
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set.');
    return {
      message: 'Server configuration error.',
      error: 'Email service is not configured.',
      success: false,
    };
  }

  try {
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Use the default or your verified domain
      to: ['liem@epicliem.com'], // Your receiving email address
      subject: `New Contact Message from ${name}`,
      replyTo: email, // Set reply-to for easy response
      html: `<p>You received a new message from your portfolio contact form:</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br>')}</p>`, // Format message for HTML
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        message: 'Failed to send message.',
        error: error.message,
        success: false,
      };
    }

    console.log('Email sent successfully:', data);
    return { message: 'Message sent successfully!', success: true };

  } catch (e: unknown) {
    console.error('Error sending email:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      message: 'An unexpected error occurred.',
      error: errorMessage,
      success: false,
    };
  }
}

// --- Guestbook Logic --- 

// Basic input validation schema for Guestbook
const GuestbookEntrySchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(100),
  message: z.string().min(1, "Message cannot be empty.").max(500),
});

// Type for guestbook entries fetched from DB
export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  created_at: Date;
  ip?: string;
};

// Type for the result of the add action
export type AddEntryState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    message?: string[];
    moderation?: string;
  };
};

export async function addGuestbookEntry(
  prevState: AddEntryState | null,
  formData: FormData
): Promise<AddEntryState> {
  const rawFormData = {
    name: formData.get("name"),
    message: formData.get("message"),
  };

  // 1. Validate Input
  const validatedFields = GuestbookEntrySchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, message } = validatedFields.data;

  // Dynamically ensure the ip column exists for rate limiting & storage
  try {
    await sql`ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS ip VARCHAR(45)`;
  } catch (error) {
    console.error("Migration error creating ip column:", error);
  }

  // Get client IP for rate limiting
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") ?? "unknown";

  // IP Blacklist: disallow posts from blocked IPs
  try {
    const blacklisted = await sql<{ ip: string }>`
      SELECT ip FROM blacklisted_ips WHERE ip = ${ip} LIMIT 1
    `;
    if (blacklisted.rows[0]) {
      return {
        success: false,
        message: "Your IP has been blocked from posting."
      };
    }
  } catch (error) {
    console.error("Blacklist check error:", error);
  }

  // 2. Rate Limiting: prevent submissions more than once per minute per IP
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  try {
    const recentEntries = await sql<{created_at: string}>`
      SELECT created_at FROM guestbook_entries
      WHERE ip = ${ip}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const lastEntry = recentEntries.rows[0];
    if (lastEntry) {
      const lastTime = new Date(lastEntry.created_at).getTime();
      if (Date.now() - lastTime < RATE_LIMIT_WINDOW_MS) {
        return {
          success: false,
          message: "You're posting too frequently. Please wait a minute before posting again.",
        };
      }
    }
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Continue with submission if rate limit check fails
  }

  // 2. Moderate Content
  const moderationResult = await moderateContent(name, message);
  if (!moderationResult.is_safe) {
    return {
      success: false,
      message: "Submission failed. Please try again later.",
    };
  }

  // 3. Insert into Database
  try {
    await sql`
      INSERT INTO guestbook_entries (name, message, ip)
      VALUES (${name}, ${message}, ${ip})
    `;
    // Revalidate the root path since guestbook is a tab there
    revalidatePath("/"); 
    return { success: true, message: "Entry added successfully!" };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Database Error: Failed to add entry.",
    };
  }
}

export async function getGuestbookEntries(): Promise<GuestbookEntry[]> {
  try {
    // Fetch the latest 50 entries, newest first
    const data = await sql<GuestbookEntry>`
      SELECT id, name, message, created_at, ip
      FROM guestbook_entries
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

// Admin entries loader state
export type AdminEntriesState = {
  success: boolean;
  message?: string;
  entries?: GuestbookEntry[];
};

export async function getAdminEntries(
  prevState: AdminEntriesState | null,
  formData: FormData
): Promise<AdminEntriesState> {
  'use server';
  const password = formData.get('password');
  if (typeof password !== 'string') {
    return { success: false, message: 'Invalid credentials.' };
  }
  // Check that ADMIN_PASSWORD is set and matches
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (typeof adminPassword !== 'string' || !adminPassword) {
    console.error('ADMIN_PASSWORD is not set.');
    return { success: false, message: 'Server configuration error.' };
  }
  if (password !== adminPassword) {
    return { success: false, message: 'Invalid credentials.' };
  }
  try {
    const data = await sql<GuestbookEntry>`
      SELECT id, name, message, created_at, ip
      FROM guestbook_entries
      ORDER BY created_at DESC
    `;
    return { success: true, entries: data.rows };
  } catch (error) {
    console.error('DB fetch error:', error);
    return { success: false, message: 'Error fetching entries.' };
  }
}

export async function deleteGuestbookEntry(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  'use server';
  const id = formData.get('id');
  const password = formData.get('password');
  if (typeof id !== 'string' || typeof password !== 'string') {
    return { success: false, message: 'Invalid request.' };
  }
  // Check that ADMIN_PASSWORD is set and matches
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (typeof adminPassword !== 'string' || !adminPassword) {
    console.error('ADMIN_PASSWORD is not set.');
    return { success: false, message: 'Server configuration error.' };
  }
  if (password !== adminPassword) {
    return { success: false, message: 'Unauthorized.' };
  }
  try {
    await sql`
      DELETE FROM guestbook_entries WHERE id = ${id}
    `;
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, message: 'Entry deleted.' };
  } catch (error) {
    console.error('DB delete error:', error);
    return { success: false, message: 'Deletion failed.' };
  }
}

// --- IP Blacklist Logic ---

export type BlacklistEntry = {
  ip: string;
  created_at: Date;
};

export type BlacklistState = {
  success: boolean;
  message?: string;
  entries?: BlacklistEntry[];
};

export async function getBlacklistedIps(
  prevState: BlacklistState | null,
  formData: FormData
): Promise<BlacklistState> {
  'use server';
  const password = formData.get('password');
  if (typeof password !== 'string') {
    return { success: false, message: 'Invalid credentials.' };
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (typeof adminPassword !== 'string' || !adminPassword) {
    console.error('ADMIN_PASSWORD is not set.');
    return { success: false, message: 'Server configuration error.' };
  }
  if (password !== adminPassword) {
    return { success: false, message: 'Invalid credentials.' };
  }
  try {
    const data = await sql<BlacklistEntry>`
      SELECT ip, created_at
      FROM blacklisted_ips
      ORDER BY created_at DESC
    `;
    return { success: true, entries: data.rows };
  } catch (error) {
    console.error('DB fetch error (blacklist):', error);
    return { success: false, message: 'Error fetching blacklist.' };
  }
}

export async function addBlacklistedIp(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  'use server';
  const password = formData.get('password');
  const ip = formData.get('ip');
  if (typeof password !== 'string' || typeof ip !== 'string') {
    return { success: false, message: 'Invalid request.' };
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (typeof adminPassword !== 'string' || !adminPassword) {
    console.error('ADMIN_PASSWORD is not set.');
    return { success: false, message: 'Server configuration error.' };
  }
  if (password !== adminPassword) {
    return { success: false, message: 'Invalid credentials.' };
  }
  try {
    await sql`
      INSERT INTO blacklisted_ips (ip)
      VALUES (${ip})
      ON CONFLICT DO NOTHING
    `;
    revalidatePath('/admin');
    return { success: true, message: 'IP blocked successfully.' };
  } catch (error) {
    console.error('DB insert error (blacklist):', error);
    return { success: false, message: 'Error blocking IP.' };
  }
}

export async function removeBlacklistedIp(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  'use server';
  const password = formData.get('password');
  const ip = formData.get('ip');
  if (typeof password !== 'string' || typeof ip !== 'string') {
    return { success: false, message: 'Invalid request.' };
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (typeof adminPassword !== 'string' || !adminPassword) {
    console.error('ADMIN_PASSWORD is not set.');
    return { success: false, message: 'Server configuration error.' };
  }
  if (password !== adminPassword) {
    return { success: false, message: 'Invalid credentials.' };
  }
  try {
    await sql`
      DELETE FROM blacklisted_ips WHERE ip = ${ip}
    `;
    revalidatePath('/admin');
    return { success: true, message: 'IP unblocked successfully.' };
  } catch (error) {
    console.error('DB delete error (blacklist):', error);
    return { success: false, message: 'Error unblocking IP.' };
  }
} 