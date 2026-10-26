import { beforeEach, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({ sql: vi.fn(), send: vi.fn(), moderate: vi.fn() }))
vi.mock("@vercel/postgres", () => ({ sql: mocks.sql }))
vi.mock("resend", () => ({ Resend: class { emails = { send: mocks.send } } }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "192.0.2.1" }) }))
vi.mock("@/lib/moderation", () => ({ moderateContent: mocks.moderate }))

import { addGuestbookEntry, getGuestbookEntries, getAdminEntries, sendContactMessage } from "../app/actions"

function form(values: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("RESEND_API_KEY", "test-only-not-a-real-key")
  vi.stubEnv("ADMIN_PASSWORD", "test-only-password")
  mocks.sql.mockReset().mockResolvedValue({ rows: [] })
  mocks.send.mockResolvedValue({ data: { id: "test" }, error: null })
  mocks.moderate.mockResolvedValue({ is_safe: true })
})

test("public guestbook entries never expose IP addresses", async () => {
  mocks.sql.mockResolvedValue({ rows: [{ id: "1", name: "Visitor", message: "Hello", created_at: new Date(), ip: "192.0.2.1" }] })
  const entries = await getGuestbookEntries()
  expect(entries[0]).not.toHaveProperty("ip")
  expect(mocks.sql.mock.calls[0][0].join("")).not.toMatch(/created_at,\s*ip/)
})

test("admin guestbook access still requires a password and retains IP addresses", async () => {
  const row = { id: "1", name: "Visitor", message: "Hello", created_at: new Date(), ip: "192.0.2.1" }
  mocks.sql.mockResolvedValue({ rows: [row] })
  expect((await getAdminEntries(null, form({ password: "wrong" }))).success).toBe(false)
  expect(mocks.sql).not.toHaveBeenCalled()
  expect((await getAdminEntries(null, form({ password: "test-only-password" }))).entries).toEqual([row])
})

test("contact input cannot inject HTML into notification emails", async () => {
  const result = await sendContactMessage({ success: false, message: "" }, form({
    name: '<img src="https://example.test/tracker">', email: "visitor@example.test", message: '<a href="https://example.test">Click</a>\nSecond line',
  }))
  expect(result.success).toBe(true)
  const email = mocks.send.mock.calls[0][0]
  expect(email.html).not.toContain('<img')
  expect(email.html).not.toContain('<a href=')
  expect(email.html).toContain('&lt;img')
  expect(email.html).toContain('<br>Second line')
})

test("whitespace-only guestbook entries are rejected before accessing the database", async () => {
  const result = await addGuestbookEntry(null, form({ name: "   ", message: "\n " }))
  expect(result.success).toBe(false)
  expect(mocks.sql).not.toHaveBeenCalled()
})

test.each(["blacklist", "rate limit"])("a failed %s check cannot admit a post", async (failure) => {
  mocks.sql.mockImplementation(async (parts: TemplateStringsArray) => {
    const query = parts.join("")
    if ((failure === "blacklist" && query.includes("SELECT ip")) || (failure === "rate limit" && query.includes("SELECT created_at"))) throw new Error("Database unavailable")
    return { rows: [] }
  })
  const result = await addGuestbookEntry(null, form({ name: "Visitor", message: "Hello" }))
  expect(result.success).toBe(false)
  expect(mocks.sql.mock.calls.some(([parts]) => parts.join("").includes("INSERT INTO"))).toBe(false)
})

test("safe guestbook submissions still insert after all checks pass", async () => {
  expect((await addGuestbookEntry(null, form({ name: "Visitor", message: "Hello" }))).success).toBe(true)
  expect(mocks.sql.mock.calls.some(([parts]) => parts.join("").includes("INSERT INTO"))).toBe(true)
})

test("rejected moderation results never reach the insert", async () => {
  mocks.moderate.mockResolvedValue({ is_safe: false })
  expect((await addGuestbookEntry(null, form({ name: "Visitor", message: "Hello" }))).success).toBe(false)
  expect(mocks.sql.mock.calls.some(([parts]) => parts.join("").includes("INSERT INTO"))).toBe(false)
})

test.each(["   ", "x".repeat(10001)])("invalid contact messages are rejected without sending email", async message => {
  const result = await sendContactMessage({ success: false, message: "" }, form({ name: "Visitor", email: "visitor@example.test", message }))
  expect(result.success).toBe(false)
  expect(mocks.send).not.toHaveBeenCalled()
})
