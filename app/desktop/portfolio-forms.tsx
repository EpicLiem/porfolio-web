"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { addGuestbookEntry, getGuestbookEntries, sendContactMessage } from "@/app/actions";
import type { FormResult, GuestbookResult } from "@/lib/forms-service";
import "./portfolio-forms.css";

function MessageForm({ kind, onSaved }: { kind: "contact" | "guestbook"; onSaved?: () => void }) {
  const id = useId();
  const contact = kind === "contact";
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [result, setResult] = useState<FormResult | null>(null);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new FormData(event.currentTarget);
    submitting.current = true;
    setPending(true);
    setResult(null);
    try {
      const response = await (contact ? sendContactMessage : addGuestbookEntry)(null, data);
      setResult(response);
      if (response.success) {
        setValues({ name: "", email: "", message: "" });
        onSaved?.();
      }
    } catch {
      setResult({ success: false, message: "The connection was interrupted. Your text is still here. Check whether it arrived before trying again." });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  const fields = contact ? (["name", "email", "message"] as const) : (["name", "message"] as const);
  return <form className="portfolio-message-form" onSubmit={submit} aria-busy={pending}>
    {fields.map(field => {
      const errors = result?.errors?.[field];
      const props = {
        id: `${id}-${field}`, name: field, required: true, disabled: pending,
        value: values[field],
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues(current => ({ ...current, [field]: event.target.value })),
        "aria-invalid": errors?.length ? true : undefined,
        "aria-describedby": errors?.length ? `${id}-${field}-error` : undefined,
      };
      return <div className="portfolio-form-field" key={field}>
        <label htmlFor={props.id}>{field === "name" ? "Name" : field === "email" ? "Email" : "Message"}</label>
        {field === "message" ? <textarea {...props} rows={contact ? 6 : 4} maxLength={contact ? 10000 : 500} /> : <input {...props} type={field === "email" ? "email" : "text"} autoComplete={field === "email" ? "email" : "name"} maxLength={field === "email" ? 254 : 100} />}
        {errors?.length ? <p className="portfolio-field-error" id={`${id}-${field}-error`}>{errors.join(" ")}</p> : null}
      </div>;
    })}
    {!contact && <p className="portfolio-form-note">Up to 500 characters. Entries are public and checked for spam and harmful content.</p>}
    <button type="submit" disabled={pending}>{pending ? (contact ? "Sending…" : "Posting…") : (contact ? "Send message" : "Sign guestbook")}</button>
    <div className="portfolio-form-status" role="status" aria-live="polite" aria-atomic="true">
      {pending ? (contact ? "Sending your message…" : "Checking and posting your entry…") : result?.message}
    </div>
  </form>;
}

export function ContactForm() {
  return <section className="portfolio-forms" aria-label="Contact form">
    <h2>Send a message</h2>
    <p>Have a project in mind? Write here or email <a href="mailto:liem@epicliem.com">liem@epicliem.com</a>.</p>
    <MessageForm kind="contact" />
  </section>;
}

function GuestbookContent() {
  const [result, setResult] = useState<GuestbookResult | null>(null);
  const [loading, setLoading] = useState(true);
  const request = useRef({ id: 0 });
  useEffect(() => {
    let active = true;
    const requests = request.current;
    const current = ++request.current.id;
    getGuestbookEntries().then(response => {
      if (active && request.current.id === current) { setResult(response); setLoading(false); }
    }).catch(() => {
      if (active && request.current.id === current) { setResult({ success: false, message: "The guestbook couldn't be loaded. Please try refreshing." }); setLoading(false); }
    });
    return () => { active = false; requests.id++; };
  }, []);
  async function refresh() {
    const current = ++request.current.id;
    setLoading(true);
    try {
      const response = await getGuestbookEntries();
      if (request.current.id === current) setResult(response);
    } catch {
      if (request.current.id === current) setResult({ success: false, message: "The guestbook couldn't be loaded. Please try refreshing." });
    } finally {
      if (request.current.id === current) setLoading(false);
    }
  }
  return <section className="portfolio-forms" aria-label="Guestbook">
    <h2>Guestbook</h2>
    <p>Leave a note from your visit.</p>
    <MessageForm kind="guestbook" onSaved={() => { void refresh(); }} />
    <div className="portfolio-guestbook-heading"><h3>Recent entries</h3><button type="button" disabled={loading} onClick={() => { void refresh(); }}>{loading ? "Loading…" : "Refresh entries"}</button></div>
    <div aria-live="polite" aria-busy={loading}>
      {loading ? <p role="status">Loading guestbook entries…</p> : result?.success ? result.entries.length ? <ol className="portfolio-guestbook-entries">
        {result.entries.map(entry => <li key={entry.id}>
          <div className="portfolio-guestbook-byline"><strong>{entry.name}</strong><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time></div>
          <p>{entry.message}</p>
        </li>)}
      </ol> : <p>No entries yet. Be the first to sign.</p> : <p role="status">{result?.message}</p>}
    </div>
  </section>;
}

export function GuestbookWindow({ isOpen = true }: { isOpen?: boolean }) {
  return isOpen ? <GuestbookContent /> : null;
}
