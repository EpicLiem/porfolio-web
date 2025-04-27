'use client';

import React, { useState, useTransition, useActionState, useEffect } from 'react';
import { getAdminEntries, deleteGuestbookEntry, getBlacklistedIps, addBlacklistedIp, removeBlacklistedIp, type AdminEntriesState, type BlacklistState, type BlacklistEntry } from '../actions';

// Client-only admin page for managing guestbook entries
export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [adminState, adminAction] = useActionState<AdminEntriesState | null, FormData>(getAdminEntries, null);
  const [deleteState, deleteAction] = useActionState<{ success: boolean; message: string } | null, FormData>(deleteGuestbookEntry, null);
  const [isPending, startTransition] = useTransition();
  const [blacklistState, blacklistAction] = useActionState<BlacklistState | null, FormData>(getBlacklistedIps, null);
  const [addBlacklistState, addBlacklistAction] = useActionState<{ success: boolean; message: string } | null, FormData>(addBlacklistedIp, null);
  const [removeBlacklistState, removeBlacklistAction] = useActionState<{ success: boolean; message: string } | null, FormData>(removeBlacklistedIp, null);
  const [entries, setEntries] = useState(adminState?.entries || []);
  const [blacklistEntries, setBlacklistEntries] = useState<BlacklistEntry[]>(blacklistState?.entries || []);

  // When adminState updates successfully, update local entries
  useEffect(() => {
    if (adminState && adminState.success && adminState.entries) {
      setEntries(adminState.entries);
      // Fetch blacklist after loading entries
      const fd = new FormData();
      fd.append('password', password);
      blacklistAction(fd);
    }
  }, [adminState]);

  // Update local blacklist entries when state changes
  useEffect(() => {
    if (blacklistState && blacklistState.success && blacklistState.entries) {
      setBlacklistEntries(blacklistState.entries);
    }
  }, [blacklistState]);

  // Re-fetch blacklist after adding an IP
  useEffect(() => {
    if (addBlacklistState && addBlacklistState.success) {
      const fd = new FormData();
      fd.append('password', password);
      blacklistAction(fd);
    }
  }, [addBlacklistState, password, blacklistAction]);

  // Re-fetch blacklist after removing an IP
  useEffect(() => {
    if (removeBlacklistState && removeBlacklistState.success) {
      const fd = new FormData();
      fd.append('password', password);
      blacklistAction(fd);
    }
  }, [removeBlacklistState, password, blacklistAction]);

  // Handle delete success by removing entry from local list
  useEffect(() => {
    if (deleteState && deleteState.success) {
      // Remove last deleted ID from entries
      const lastForm = deleteAction; // not directly available, so simply refetch via adminAction
      startTransition(() => {
        const formData = new FormData();
        formData.append('password', password);
        adminAction(formData);
      });
    }
  }, [deleteState, password, adminAction]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="p-6 font-mono bg-zinc-900 text-amber-100 min-h-screen">
      <h1 className="text-2xl mb-4">Admin: Guestbook Management</h1>
      <form action={adminAction} className="flex items-center gap-2 mb-4">
        <input
          type="password"
          name="password"
          placeholder="Enter admin password"
          value={password}
          onChange={handlePasswordChange}
          className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
        >
          {isPending ? 'Loading...' : 'Load Entries'}
        </button>
      </form>
      {adminState && !adminState.success && (
        <p className="text-red-400 mb-4">{adminState.message}</p>
      )}
      {entries.length > 0 && (
        <table className="w-full table-auto border border-zinc-700">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="px-2 py-1 text-left">ID</th>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-left">Message</th>
              <th className="px-2 py-1 text-left">Created At</th>
              <th className="px-2 py-1 text-left">IP</th>
              <th className="px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-zinc-800">
                <td className="px-2 py-1">{entry.id}</td>
                <td className="px-2 py-1 break-all">{entry.name}</td>
                <td className="px-2 py-1 break-all">{entry.message}</td>
                <td className="px-2 py-1">{new Date(entry.created_at).toLocaleString()}</td>
                <td className="px-2 py-1 break-all">{entry.ip ?? 'N/A'}</td>
                <td className="px-2 py-1">
                  <form action={deleteAction} className="inline">
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="password" value={password} />
                    <button
                      type="submit"
                      className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {deleteState && (
        <p className={`mt-4 ${deleteState.success ? 'text-green-400' : 'text-red-400'}`}>{deleteState.message}</p>
      )}
      {/* --- Blacklist Management --- */}
      <div className="mt-8">
        <h2 className="text-xl mb-2">Blacklisted IPs</h2>
        <form action={addBlacklistAction} className="flex items-center gap-2 mb-4">
          <input type="hidden" name="password" value={password} />
          <input
            type="text"
            name="ip"
            placeholder="IP to block"
            className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-white"
          />
          <button type="submit" className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-xs">
            Block IP
          </button>
        </form>
        {addBlacklistState && (
          <p className={`${addBlacklistState.success ? 'text-green-400' : 'text-red-400'} mb-4`}>
            {addBlacklistState.message}
          </p>
        )}
        <table className="w-full table-auto border border-zinc-700">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="px-2 py-1 text-left">IP</th>
              <th className="px-2 py-1 text-left">Blocked At</th>
              <th className="px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blacklistEntries.map((b) => (
              <tr key={b.ip} className="border-b border-zinc-800">
                <td className="px-2 py-1 break-all">{b.ip}</td>
                <td className="px-2 py-1">{new Date(b.created_at).toLocaleString()}</td>
                <td className="px-2 py-1">
                  <form action={removeBlacklistAction} className="inline">
                    <input type="hidden" name="password" value={password} />
                    <input type="hidden" name="ip" value={b.ip} />
                    <button type="submit" className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-xs">
                      Unblock
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {removeBlacklistState && (
          <p className={`${removeBlacklistState.success ? 'text-green-400' : 'text-red-400'} mt-4`}>
            {removeBlacklistState.message}
          </p>
        )}
      </div>
    </div>
  );
} 