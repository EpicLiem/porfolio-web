import assert from "node:assert/strict";
import test from "node:test";
import { createFormsService, type FormsDependencies } from "./forms-service";
import { insertGuestbookEntry, type DatabaseClient } from "./forms-database";
import { moderateContent } from "./moderation";

function form(values = { name: "Visitor", email: "visitor@example.com", message: "Hello!" }) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function setup(overrides: Partial<FormsDependencies> = {}) {
  const calls: string[] = [];
  const service = createFormsService({
    contactConfigured: true, databaseConfigured: true, moderationConfigured: true,
    send: async () => { calls.push("send"); }, moderate: async () => { calls.push("moderate"); return { status: "safe" }; },
    insert: async () => { calls.push("insert"); return "saved"; }, list: async () => [], ...overrides,
  });
  return { service, calls };
}
test("rejects blank, oversized, invalid email, header injection and non-string inputs before transport", async () => {
  const { service, calls } = setup();
  for (const values of [
    { name: "  ", email: "visitor@example.com", message: "hi" },
    { name: "Visitor\r\nBcc: x", email: "visitor@example.com", message: "hi" },
    { name: "Visitor", email: "invalid", message: "hi" },
    { name: "Visitor", email: "visitor@example.com", message: "x".repeat(10001) },
  ]) assert.equal((await service.contact(form(values))).success, false);
  const data = form(); data.set("name", new Blob(["file"]), "name.txt");
  assert.equal((await service.contact(data)).success, false);
  const guest = form(); guest.set("message", "x".repeat(501));
  assert.equal((await service.add(guest, "127.0.0.1")).success, false);
  assert.deepEqual(calls, []);
});
test("trims validated contact fields and surfaces safe transport failures", async () => {
  const { service } = setup({ send: async data => { assert.equal(data.name, "Visitor"); assert.equal(data.message, "Hello!"); } });
  assert.equal((await service.contact(form({ name: " Visitor ", email: "visitor@example.com", message: " Hello! " }))).success, true);
  const broken = setup({ send: async () => { throw new Error("secret-provider-payload"); } }).service;
  const result = await broken.contact(form());
  assert.equal(result.success, false);
  assert.ok(!result.message.includes("secret"));
});
test("unconfigured services never call transports and failed reads are not empty success", async () => {
  const { service, calls } = setup({ contactConfigured: false, databaseConfigured: false, moderationConfigured: false });
  assert.equal((await service.contact(form())).success, false);
  assert.equal((await service.add(form(), "127.0.0.1")).success, false);
  assert.equal((await service.list()).success, false);
  assert.deepEqual(calls, []);
  assert.deepEqual(await setup().service.list(), { success: true, entries: [] });
  assert.equal((await setup({ list: async () => { throw new Error("offline"); } }).service.list()).success, false);
});
test("missing IP and rejected or unavailable moderation never write", async () => {
  const missing = setup();
  assert.equal((await missing.service.add(form(), null)).success, false);
  assert.deepEqual(missing.calls, []);
  for (const status of ["rejected", "unavailable"] as const) {
    const { service, calls } = setup({ moderate: async () => ({ status }) });
    assert.equal((await service.add(form(), "127.0.0.1")).success, false);
    assert.deepEqual(calls, []);
  }
  for (const result of ["blocked", "limited"] as const) assert.equal((await setup({ insert: async () => result }).service.add(form(), "127.0.0.1")).success, false);
  const success = setup();
  assert.equal((await success.service.add(form(), "127.0.0.1")).success, true);
  assert.deepEqual(success.calls, ["moderate", "insert"]);
});
test("moderation validates response shape and fails closed on malformed/failed responses", async () => {
  for (const value of [null, "{}", "not json", '{"is_safe":"true"}', '{"is_safe":true}', '{"is_safe":true,"reason":""}']) {
    assert.equal((await moderateContent("Visitor", "Hello", async () => value)).status, "unavailable");
  }
  assert.equal((await moderateContent("Visitor", "Hello", async () => { throw new Error("offline"); })).status, "unavailable");
  assert.equal((await moderateContent("Visitor", "Hello", async () => '{"is_safe":false}')).status, "rejected");
  assert.equal((await moderateContent("Visitor", "Hello", async () => '{"is_safe":true,"reason":"Friendly"}')).status, "safe");
});
test("database serializes checks and parameterizes writes; blocked/limited/error paths rollback and release", async () => {
  for (const outcome of ["saved", "blocked", "limited", "error"] as const) {
    const queries: { text: string; values?: string[] }[] = [];
    let released = false;
    const client: DatabaseClient = {
      async query(text, values) {
        queries.push({ text, values });
        if (text.startsWith("INSERT") && outcome === "error") throw new Error("offline");
        return { rows: (outcome === "blocked" && text.includes("FROM blacklisted_ips")) || (outcome === "limited" && text.includes("FROM guestbook_entries")) ? [{ id: "1" }] : [] };
      }, release: () => { released = true; },
    };
    const action = insertGuestbookEntry({ name: "O'Reilly", message: "'); DROP TABLE guestbook_entries; --" }, "127.0.0.1", async () => client);
    if (outcome === "error") await assert.rejects(action); else assert.equal(await action, outcome);
    assert.equal(released, true);
    assert.match(queries[2].text, /pg_advisory_xact_lock/);
    assert.equal(queries.at(-1)?.text, outcome === "saved" ? "COMMIT" : "ROLLBACK");
    const insert = queries.find(query => query.text.startsWith("INSERT"));
    if (outcome === "blocked" || outcome === "limited") assert.equal(insert, undefined);
    else { assert.deepEqual(insert?.values, ["O'Reilly", "'); DROP TABLE guestbook_entries; --", "127.0.0.1"]); assert.ok(!insert?.text.includes("DROP")); }
    assert.ok(queries.every(query => !/ALTER|CREATE TABLE/.test(query.text)));
  }
});
