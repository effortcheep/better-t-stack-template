import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@better-t-stack-template/db", () => ({
  db: {
    select: vi.fn(),
  },
  eq: vi.fn(),
}))

import { db } from "@better-t-stack-template/db"
import {
  invalidateJwksCache,
  resolveJwkRow,
} from "~/lib/jwks-cache"

const mockDb = db as unknown as {
  select: ReturnType<typeof vi.fn>
}

describe("jwks-cache", () => {
  beforeEach(() => {
    invalidateJwksCache()
    mockDb.select.mockReset()
  })

  it("resolveJwkRow 按 kid 匹配", async () => {
    const keys = [
      { id: "kid-a", publicKey: "{}", createdAt: new Date("2024-01-01") },
      { id: "kid-b", publicKey: "{}", createdAt: new Date("2025-01-01") },
    ]
    mockDb.select.mockReturnValue({
      from: vi.fn().mockResolvedValue(keys),
    })

    const row = await resolveJwkRow("kid-a")
    expect(row?.id).toBe("kid-a")
    expect(mockDb.select).toHaveBeenCalledTimes(1)

    // 缓存命中 — 不再查库
    await resolveJwkRow("kid-b")
    expect(mockDb.select).toHaveBeenCalledTimes(1)
  })

  it("kid 未命中时回退最新 key", async () => {
    const keys = [
      { id: "old", publicKey: "{}", createdAt: new Date("2024-01-01") },
      { id: "new", publicKey: "{}", createdAt: new Date("2025-06-01") },
    ]
    mockDb.select.mockReturnValue({
      from: vi.fn().mockResolvedValue(keys),
    })

    const row = await resolveJwkRow("unknown")
    expect(row?.id).toBe("new")
  })
})
