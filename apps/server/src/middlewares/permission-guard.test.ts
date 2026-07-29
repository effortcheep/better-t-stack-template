import { Hono } from "hono"
import { describe, it, expect, vi, beforeEach } from "vitest"

import type { AppBindings } from "~/lib/type"
import { createPermissionGuard, crudPermissionRules } from "./permission-guard"

vi.mock("~/services/permission-cache", () => ({
  getUserPermissions: vi.fn(),
}))

import { getUserPermissions } from "~/services/permission-cache"

const mockGetUserPermissions = getUserPermissions as ReturnType<typeof vi.fn>

function testApp(rules: ReturnType<typeof crudPermissionRules>) {
  const app = new Hono<AppBindings>()
  app.use("*", async (c, next) => {
    c.set("user", { sub: "user-1" } as never)
    await next()
  })
  app.use("*", createPermissionGuard(rules))
  app.get("/api/v1/tasks", (c) => c.json({ ok: true }))
  app.post("/api/v1/tasks", (c) => c.json({ ok: true }))
  return app
}

describe("createPermissionGuard", () => {
  beforeEach(() => {
    mockGetUserPermissions.mockReset()
  })

  it("无权限时 GET 返回 403", async () => {
    mockGetUserPermissions.mockResolvedValue([])
    const app = testApp(crudPermissionRules("tasks", "tasks"))
    const res = await app.request("/api/v1/tasks")
    expect(res.status).toBe(403)
    const body = (await res.json()) as { ret: number }
    expect(body.ret).toBe(-1)
  })

  it("有 tasks:read 时 GET 放行", async () => {
    mockGetUserPermissions.mockResolvedValue(["tasks:read"])
    const app = testApp(crudPermissionRules("tasks", "tasks"))
    const res = await app.request("/api/v1/tasks")
    expect(res.status).toBe(200)
  })

  it("*:* 通配放行任意操作", async () => {
    mockGetUserPermissions.mockResolvedValue(["*:*"])
    const app = testApp(crudPermissionRules("tasks", "tasks"))
    const res = await app.request("/api/v1/tasks", { method: "POST" })
    expect(res.status).toBe(200)
  })

  it("仅有 read 时 POST 返回 403", async () => {
    mockGetUserPermissions.mockResolvedValue(["tasks:read"])
    const app = testApp(crudPermissionRules("tasks", "tasks"))
    const res = await app.request("/api/v1/tasks", { method: "POST" })
    expect(res.status).toBe(403)
  })
})
