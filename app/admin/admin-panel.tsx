"use client";

import { useState, useTransition, type FormEvent } from "react";
import { blockAdminIp, deleteAdminEntry, getAdminDashboard, loginAdmin, logoutAdmin, unblockAdminIp } from "./actions";
import type { AdminDashboardResult, AdminResult } from "@/lib/admin-service";

export default function AdminPanel({ initial }: { initial: AdminDashboardResult }) {
  const [dashboard, setDashboard] = useState(initial);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const page = dashboard.success ? dashboard.page : 1;
  const blockedPage = dashboard.success ? dashboard.blockedPage : 1;

  function run(action: () => Promise<void>) {
    setNotice("");
    startTransition(async () => {
      try { await action(); }
      catch { setNotice("The request could not be completed. Refresh before trying again."); }
    });
  }

  async function refresh(nextPage = page, nextBlockedPage = blockedPage) {
    setDashboard(await getAdminDashboard(nextPage, nextBlockedPage));
    setConfirmDelete(null);
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    run(async () => {
      const result = await loginAdmin(null, data);
      setNotice(result.message);
      if (result.success) { form.reset(); await refresh(1, 1); }
    });
  }

  function mutate(action: (data: FormData) => Promise<AdminResult>, data: FormData, reset?: () => void) {
    run(async () => {
      const result = await action(data);
      setNotice(result.message);
      if (result.success) reset?.();
      await refresh();
    });
  }

  function field(name: string, value: string) {
    const data = new FormData();
    data.set(name, value);
    return data;
  }

  return <section aria-label="Guestbook management" aria-busy={pending}>
    <p role="status" aria-live="polite" className="admin-notice">{notice || (pending ? "Working…" : "")}</p>
    {!dashboard.success && <p role="alert">{dashboard.message}</p>}
    {!dashboard.success && dashboard.unauthorized && <form onSubmit={login} className="admin-login">
      <label htmlFor="admin-password">Admin password</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} />
      <button disabled={pending}>Sign in</button>
    </form>}
    {(dashboard.success || !dashboard.unauthorized) && <div className="admin-toolbar">
        <button disabled={pending} onClick={() => run(() => refresh())}>Refresh lists</button>
        <button disabled={pending} onClick={() => run(async () => {
          await logoutAdmin();
          setDashboard({ success: false, message: "You are signed out.", unauthorized: true });
          setNotice("");
          setConfirmDelete(null);
        })}>Sign out</button>
      </div>
    }
    {dashboard.success && <>
      <h2>Guestbook entries</h2>
      {dashboard.entries.length === 0 ? <p>No entries on this page.</p> : <ul className="admin-entries">
        {dashboard.entries.map(entry => <li key={entry.id}>
          <div className="admin-entry-heading"><strong>{entry.name}</strong><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString()}</time></div>
          <p className="admin-message">{entry.message}</p>
          <p className="admin-detail">Entry {entry.id} · IP: {entry.ip || "Not recorded"}</p>
          <div className="admin-row-actions">
            {confirmDelete === entry.id ? <>
              <span>Delete this entry permanently?</span>
              <button disabled={pending} onClick={() => mutate(deleteAdminEntry, field("id", entry.id))}>Confirm delete</button>
              <button disabled={pending} onClick={() => setConfirmDelete(null)}>Cancel</button>
            </> : <button disabled={pending} aria-label={`Delete entry by ${entry.name}`} onClick={() => setConfirmDelete(entry.id)}>Delete entry</button>}
            {entry.ip && <button disabled={pending} aria-label={`Block IP ${entry.ip}`} onClick={() => mutate(blockAdminIp, field("ip", entry.ip!))}>Block IP</button>}
          </div>
        </li>)}
      </ul>}
      <nav className="admin-pagination" aria-label="Entry pages">
        <button disabled={pending || page === 1} onClick={() => run(() => refresh(page - 1))}>Previous entries</button>
        <span>Page {page}</span>
        <button disabled={pending || !dashboard.hasMore} onClick={() => run(() => refresh(page + 1))}>Next entries</button>
      </nav>
      <h2>Blocked IP addresses</h2>
      <p>Blocking an address prevents new guestbook posts. Existing entries stay visible until deleted.</p>
      <form className="admin-block-form" onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        mutate(blockAdminIp, new FormData(form), () => form.reset());
      }}>
        <label htmlFor="blocked-ip">IPv4 or IPv6 address</label>
        <input id="blocked-ip" name="ip" required maxLength={45} autoComplete="off" spellCheck={false} />
        <button disabled={pending}>Block address</button>
      </form>
      {dashboard.blockedIps.length === 0 ? <p>No blocked addresses on this page.</p> : <ul className="admin-blocked">
        {dashboard.blockedIps.map(entry => <li key={entry.ip}>
          <div><strong>{entry.ip}</strong><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString()}</time></div>
          <button disabled={pending} aria-label={`Unblock ${entry.ip}`} onClick={() => mutate(unblockAdminIp, field("ip", entry.ip))}>Unblock</button>
        </li>)}
      </ul>}
      <nav className="admin-pagination" aria-label="Blocked address pages">
        <button disabled={pending || blockedPage === 1} onClick={() => run(() => refresh(page, blockedPage - 1))}>Previous addresses</button>
        <span>Page {blockedPage}</span>
        <button disabled={pending || !dashboard.hasMoreBlocked} onClick={() => run(() => refresh(page, blockedPage + 1))}>Next addresses</button>
      </nav>
    </>}
  </section>;
}
