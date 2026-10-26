import { expect, test, vi } from "vitest"

test("missing moderation credentials reject rather than publish unreviewed content", async () => {
  vi.stubEnv("GROQ_API_KEY", "")
  const { moderateContent } = await import("../lib/moderation")
  expect((await moderateContent("Visitor", "Hello")).is_safe).toBe(false)
  vi.unstubAllEnvs()
})
