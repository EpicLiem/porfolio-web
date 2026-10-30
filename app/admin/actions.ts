"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isIP } from "node:net";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, checkAdminPassword, createAdminSession, verifyAdminSession, createLoginLimiter } from "@/lib/admin-auth";
import { createAdminDatabase } from "@/lib/admin-database";
import { createAdminService, type AdminResult } from "@/lib/admin-service";

const limiter = createLoginLimiter();
const cookieOptions = { httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/admin" };

async function authorized() {
  return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value, process.env.ADMIN_PASSWORD);
}

function service() {
  return createAdminService({ authorized, databaseConfigured: Boolean(process.env.POSTGRES_URL), ...createAdminDatabase() });
}

export async function loginAdmin(_previous: AdminResult | null, data: FormData): Promise<AdminResult> {
  if (!process.env.ADMIN_PASSWORD) return { success: false, message: "Guestbook administration is not configured." };
  const head = await headers();
  const forwarded = process.env.VERCEL === "1" ? head.get("x-vercel-forwarded-for") : process.env.FORMS_TRUST_PROXY === "true" ? head.get("x-forwarded-for") : null;
  const ip = forwarded?.split(",")[0]?.trim();
  const key = ip && isIP(ip) ? ip : "unidentified";
  if (!limiter.allow(key)) return { success: false, message: "Too many sign-in attempts. Try again in 15 minutes." };
  if (!checkAdminPassword(data.get("password"), process.env.ADMIN_PASSWORD)) return { success: false, message: "Incorrect password." };
  limiter.clear(key);
  (await cookies()).set(ADMIN_COOKIE, createAdminSession(process.env.ADMIN_PASSWORD), { ...cookieOptions, maxAge: ADMIN_SESSION_SECONDS });
  return { success: true, message: "Signed in." };
}

export async function logoutAdmin(): Promise<AdminResult> {
  (await cookies()).set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return { success: true, message: "Signed out." };
}

export async function getAdminDashboard(page = 1, blockedPage = 1) {
  return service().dashboard(page, blockedPage);
}

async function revalidate(result: AdminResult) {
  if (result.success) { revalidatePath("/"); revalidatePath("/admin"); }
  return result;
}

export async function deleteAdminEntry(data: FormData): Promise<AdminResult> {
  return revalidate(await service().delete(data));
}

export async function blockAdminIp(data: FormData): Promise<AdminResult> {
  return revalidate(await service().block(data));
}

export async function unblockAdminIp(data: FormData): Promise<AdminResult> {
  return revalidate(await service().unblock(data));
}
