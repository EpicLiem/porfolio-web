import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboard } from "./actions";
import AdminPanel from "./admin-panel";
import "./admin.css";

export const metadata: Metadata = {
  title: "Guestbook administration",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminPage() {
  return <main className="admin-page">
    <header><Link href="/">Back to portfolio</Link><h1>Guestbook administration</h1></header>
    <AdminPanel initial={await getAdminDashboard()} />
  </main>;
}
