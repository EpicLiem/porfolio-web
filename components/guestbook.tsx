'use client';

import React, { useState, useEffect, useRef, useTransition, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import SystemWindow from './system-window'; // Import SystemWindow
import {
  addGuestbookEntry,
  getGuestbookEntries,
  type GuestbookEntry,
  type AddEntryState,
} from '../app/actions';

// --- Helper Components ---

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      // Match button style potentially used elsewhere (adjust if needed)
      className="px-4 py-2 text-sm font-medium transition-colors border rounded bg-zinc-800 border-amber-700 text-amber-100 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting...' : 'Leave a Message >_'}
    </button>
  );
}

function FormattedDate({ date }: { date: Date }) {
  // Check if date is valid before formatting
  if (isNaN(date.getTime())) {
      return <span className="text-xs text-red-400/70">(Invalid Date)</span>;
  }
  return (
    <span className="text-xs text-amber-400/70">
      {date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}
    </span>
  );
}

// --- Main Guestbook Component ---

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, formAction] = useActionState<AddEntryState | null, FormData>(
    addGuestbookEntry,
    null
  );

  const fetchEntries = () => {
    startTransition(async () => {
      try {
        const fetchedEntries = await getGuestbookEntries();
        // Ensure fetched data is suitable for Date conversion
        const processedEntries = fetchedEntries.map(entry => ({
            ...entry,
            created_at: new Date(entry.created_at) // Convert string/timestamp to Date object
        }));
        setEntries(processedEntries);
      } catch (error) {
        console.error("Failed to fetch guestbook entries:", error);
        toast.error("Could not load guestbook entries.");
      }
    });
  };

  useEffect(() => {
    fetchEntries(); // Keep initial fetch
    // Remove polling interval
    // const intervalId = setInterval(fetchEntries, 15000);
    // return () => clearInterval(intervalId);
  }, []); // Keep empty dependency array for mount-only execution

  useEffect(() => {
    if (!addState) return;

    if (addState.success) {
      toast.success(addState.message || "Entry added successfully!");
      formRef.current?.reset();
      fetchEntries();
    } else {
      // When the action fails (success: false), display the main message
      // provided by the action in the toast.
      // Specific field errors (name, message, moderation) are shown below the fields.
      toast.error(addState.message || 'An unknown error occurred.');
    }
  }, [addState]);

  return (
    // Wrap everything in SystemWindow
    <SystemWindow title="Leave a Message">
      {/* Use internal div for spacing; SystemWindow provides padding */}
      <div className="space-y-6">
        {/* --- Form --- */}
        <form
          ref={formRef}
          action={formAction}
          className="space-y-3" // Remove border/bg from form itself
        >
          <h3 className="text-base font-semibold text-amber-300">\&gt; leave a message:</h3>
          <div>
            <label htmlFor="name" className="block mb-1 text-sm text-amber-200">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              maxLength={100}
              className="w-full px-3 py-2 text-sm text-white border rounded bg-zinc-700 border-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-zinc-400"
              placeholder="Your Name / Alias"
              aria-describedby={addState?.errors?.name ? "name-error" : undefined}
            />
            {addState?.errors?.name && (
              <p id="name-error" className="mt-1 text-xs text-red-400">{addState.errors.name[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 text-sm text-amber-200">
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              required
              maxLength={500}
              className="w-full px-3 py-2 text-sm text-white border rounded bg-zinc-700 border-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-zinc-400"
              placeholder="Type your message here..."
              aria-describedby={addState?.errors?.message ? "message-error" : addState?.errors?.moderation ? "moderation-error" : undefined}
            />
            {addState?.errors?.message && (
              <p id="message-error" className="mt-1 text-xs text-red-400">{addState.errors.message[0]}</p>
            )}
            {addState?.errors?.moderation && (
              <p id="moderation-error" className="mt-1 text-xs text-red-400">! Moderation Error: {addState.errors.moderation}</p>
            )}
          </div>
          <div className="flex justify-end pt-1">
            <SubmitButton />
          </div>
        </form>

        {/* Optional Separator */}
        <hr className="border-zinc-700" />

        {/* --- Entries List --- */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-amber-300">\&gt; entries ({isPending ? 'refreshing...' : entries.length}):</h3>
          {entries.length === 0 && !isPending ? (
            <p className="text-amber-200/80 text-sm italic">// No entries yet. Be the first!</p>
          ) : (
            // Add max height and scrollbar styling
            <ul className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-zinc-800 pr-2">
              {entries.map((entry) => (
                <li key={entry.id} className="p-3 border rounded border-zinc-700 bg-zinc-800/30">
                  <div className="flex items-baseline justify-between mb-1 gap-2">
                    {/* Allow name to break if very long */}
                    <span className="font-medium text-amber-100 break-all">{entry.name || '(Anonymous)'}</span>
                    {/* Ensure date is parsed correctly */}
                    <FormattedDate date={entry.created_at} />
                  </div>
                  {/* Use pre-wrap to respect newlines and break long words */}
                  <p className="text-sm text-amber-100/90 whitespace-pre-wrap break-words">{entry.message}</p>
                </li>
              ))}
            </ul>
          )}
          {isPending && entries.length > 0 && (
            <p className="text-sm text-center text-amber-300/70">[ Checking for new messages... ]</p>
          )}
        </div>
      </div> {/* Closing internal div */}
    </SystemWindow> // Closing SystemWindow
  );
}