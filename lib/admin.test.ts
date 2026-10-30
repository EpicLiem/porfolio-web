import assert from "node:assert/strict";
import test from "node:test";
import { checkAdminPassword, createAdminSession, verifyAdminSession, ADMIN_SESSION_SECONDS, createLoginLimiter } from "./admin-auth";
import { createAdminService, type AdminDependencies } from "./admin-service";
import { createAdminDatabase } from "./admin-database";

const id = "12345678-abcd-4321-abcd-123456789abc";
function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function setup(overrides: Partial<AdminDependencies> = {}) {
  const calls: string[] = [];
  const service = createAdminService({
    authorized: async () => true, databaseConfigured: true,
    listEntries: async () => { calls.push("entries"); return []; },
    listBlocked: async () => { calls.push("blocked"); return []; },
    deleteEntry: async () => { calls.push("delete"); return true; },
    blockIp: async () => { calls.push("block"); },
    unblockIp: async () => { calls.push("unblock"); return true; }, ...overrides,
  });
  return { service, calls };
}

test("password checks fail closed and sessions expire, reject tampering and rotate with the password", () => {
  const password = "test-only-long-admin-password";
  const now = 1_800_000_000_000;
  assert.equal(checkAdminPassword(password, password), true);
  for (const candidate of ["wrong", "", null, undefined, new Blob([password]), "x".repeat(4097)]) assert.equal(checkAdminPassword(candidate, password), false);
  assert.equal(checkAdminPassword("", undefined), false);
  assert.equal(checkAdminPassword("", ""), false);
  assert.throws(() => createAdminSession(""));
  const token = createAdminSession(password, now);
  assert.equal(verifyAdminSession(token, password, now), true);
  assert.equal(verifyAdminSession(token, password, now + ADMIN_SESSION_SECONDS * 1000 - 1), true);
  for (const [value, secret, time] of [
    [token, password, now + ADMIN_SESSION_SECONDS * 1000],
    [token, "rotated-password", now], [token, undefined, now],
    [token.replace("v1.", "v2."), password, now],
    [token.slice(0, -1) + (token.endsWith("a") ? "b" : "a"), password, now],
    [token + ".extra", password, now], ["", password, now], [undefined, password, now],
    [token, password, now - 2000],
  ] as const) assert.equal(verifyAdminSession(value, secret, time), false);
});

test("login limiter bounds attempts and memory, expires windows, and clears successful sign-ins", () => {
  const limiter = createLoginLimiter(2, 1000, 2);
  assert.equal(limiter.allow("a", 0), true);
  assert.equal(limiter.allow("a", 1), true);
  assert.equal(limiter.allow("a", 2), false);
  assert.equal(limiter.allow("b", 2), true);
  assert.equal(limiter.allow("c", 2), false);
  limiter.clear("a");
  assert.equal(limiter.allow("a", 3), true);
  assert.equal(limiter.allow("c", 1004), true);
});

test("every private read and mutation authorizes before DB access and rechecks revoked sessions", async () => {
  let allowed = false;
  let authCalls = 0;
  const { service, calls } = setup({ authorized: async () => { authCalls++; return allowed; } });
  const outcomes = [await service.dashboard(), await service.delete(form({ id })), await service.block(form({ ip: "127.0.0.1" })), await service.unblock(form({ ip: "127.0.0.1" }))];
  for (const outcome of outcomes) { assert.equal(outcome.success, false); assert.equal("unauthorized" in outcome && outcome.unauthorized, true); assert.ok(!("entries" in outcome)); }
  assert.equal(authCalls, 4);
  assert.deepEqual(calls, []);
  allowed = true;
  assert.equal((await service.dashboard()).success, true);
  allowed = false;
  assert.equal((await service.delete(form({ id }))).success, false);
  assert.deepEqual(calls, ["entries", "blocked"]);
});

test("unconfigured DB, malformed IDs/IPs/pages and file inputs never call persistence", async () => {
  const unconfigured = setup({ databaseConfigured: false });
  for (const action of [unconfigured.service.dashboard(), unconfigured.service.delete(form({ id })), unconfigured.service.block(form({ ip: "127.0.0.1" })), unconfigured.service.unblock(form({ ip: "127.0.0.1" }))]) assert.equal((await action).success, false);
  assert.deepEqual(unconfigured.calls, []);
  const { service, calls } = setup();
  for (const invalid of ["", "123", `${id}' OR true`, "  " + id]) assert.equal((await service.delete(form({ id: invalid }))).success, false);
  for (const invalid of ["", "hostname.example", "127.0.0.1/24", "127.0.0.1'", "999.0.0.1"]) {
    assert.equal((await service.block(form({ ip: invalid }))).success, false);
    assert.equal((await service.unblock(form({ ip: invalid }))).success, false);
  }
  const file = form({}); file.set("id", new Blob([id]), "id.txt");
  assert.equal((await service.delete(file)).success, false);
  for (const invalid of [0, -1, 1.5, NaN, Infinity, "1", 1_000_001, null]) {
    assert.equal((await service.dashboard(invalid)).success, false);
    assert.equal((await service.dashboard(1, invalid)).success, false);
  }
  assert.deepEqual(calls, []);
});

test("pagination fetches one extra record for each independent list and retains private fields for authorized users", async () => {
  const entry = { id, name: "Visitor", message: "Hello", created_at: "2026-01-01T00:00:00.000Z", ip: "127.0.0.1" };
  const service = setup({
    listEntries: async (offset, limit) => { assert.equal(offset, 50); assert.equal(limit, 51); return Array.from({ length: 51 }, () => entry); },
    listBlocked: async (offset, limit) => { assert.equal(offset, 100); assert.equal(limit, 51); return [{ ip: "::1", created_at: entry.created_at }]; },
  }).service;
  const result = await service.dashboard(2, 3);
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.page, 2); assert.equal(result.blockedPage, 3);
  assert.equal(result.entries.length, 50); assert.equal(result.hasMore, true);
  assert.equal(result.entries[0].ip, "127.0.0.1");
  assert.equal(result.blockedIps.length, 1); assert.equal(result.hasMoreBlocked, false);
});

test("valid admin mutations succeed, nonexistent records and database errors are not reported as successful", async () => {
  const { service, calls } = setup();
  assert.equal((await service.delete(form({ id }))).success, true);
  assert.equal((await service.block(form({ ip: "2001:db8::1" }))).success, true);
  assert.equal((await service.unblock(form({ ip: "127.0.0.1" }))).success, true);
  assert.deepEqual(calls, ["delete", "block", "unblock"]);
  const missing = setup({ deleteEntry: async () => false, unblockIp: async () => false }).service;
  assert.equal((await missing.delete(form({ id }))).success, false);
  assert.equal((await missing.unblock(form({ ip: "127.0.0.1" }))).success, false);
  const fail = async () => { throw new Error("secret connection string"); };
  const broken = setup({ listEntries: fail, listBlocked: fail, deleteEntry: fail, blockIp: fail, unblockIp: fail }).service;
  for (const outcome of [await broken.dashboard(), await broken.delete(form({ id })), await broken.block(form({ ip: "127.0.0.1" })), await broken.unblock(form({ ip: "127.0.0.1" }))]) {
    assert.equal(outcome.success, false); assert.ok(!JSON.stringify(outcome).includes("secret"));
  }
});

test("database operations use bound parameters, stable order and no schema changes", async () => {
  const calls: { text: string; values: (string | number)[] }[] = [];
  const db = createAdminDatabase(async (text, values) => { calls.push({ text, values }); return { rows: text.startsWith("DELETE") ? [{ id }] : [] }; });
  await db.listEntries(50, 51); await db.listBlocked(100, 51);
  assert.equal(await db.deleteEntry(id), true);
  await db.blockIp("2001:db8::1"); assert.equal(await db.unblockIp("127.0.0.1"), true);
  assert.deepEqual(calls.map(call => call.values), [[51, 50], [51, 100], [id], ["2001:db8::1"], ["127.0.0.1"]]);
  assert.match(calls[0].text, /ORDER BY created_at DESC, id DESC/);
  assert.ok(calls.every(call => !call.text.includes(id) && !/ALTER|CREATE TABLE/.test(call.text)));
});
