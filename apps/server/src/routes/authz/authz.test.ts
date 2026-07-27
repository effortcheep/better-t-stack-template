import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { testClient } from "hono/testing"
import {
  describe,
  beforeAll,
  afterAll,
  it,
  expect,
} from "vitest"

import { createMiddleware } from "hono/factory"
import { createRouter, createTestApp } from "~/lib/create-app"
import type { AppBindings } from "~/lib/type"
import { db, sql } from "@better-t-stack-template/db"
import * as routes from "./authz.routes"
import * as handlers from "./authz.handler"

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

if (process.env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'")
}

/** 构建不含 authzGuard 的测试路由 */
function createAuthzTestRouter() {
  const router = createRouter()

  router.use(
    "*",
    createMiddleware<AppBindings>(async (c, next) => {
      c.set("user", { sub: "00000000-0000-0000-0000-000000000001" })
      return next()
    }),
  )

  router
    .openapi(routes.listRoles, handlers.listRoles)
    .openapi(routes.createRole, handlers.createRole)
    .openapi(routes.getRole, handlers.getRole)
    .openapi(routes.updateRole, handlers.updateRole)
    .openapi(routes.deleteRole, handlers.deleteRole)
    .openapi(routes.listRolePermissions, handlers.listRolePermissions)
    .openapi(routes.addRolePermission, handlers.addRolePermission)
    .openapi(routes.removeRolePermission, handlers.removeRolePermission)

  return router
}

const client = testClient(createTestApp(createAuthzTestRouter()))

let createdRoleId: string | null = null

describe("authz routes", () => {

  beforeAll(async () => {
    execSync("bun db:push", {
      cwd: root,
      env: {
        ...process.env,
        DOTENV_CONFIG_PATH: path.resolve(root, "apps/server/.env.test"),
      },
    })
    // 清理上次测试运行残留数据
    await db.execute(sql`TRUNCATE TABLE user_roles, role_permissions, roles CASCADE`)

  })

  afterAll(async () => {
    await db.execute(sql`TRUNCATE TABLE user_roles, role_permissions, roles CASCADE`)
  })
  /* ======== 角色 CRUD ======== */

  it("POST /api/v1/roles — 创建角色", async () => {
    const res = await client.roles.$post({
      json: { name: "tester", description: "测试角色" },
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(body.data).toHaveProperty("id")
    expect(body.data.name).toBe("tester")
    createdRoleId = body.data.id as string
  })

  it("POST /api/v1/roles — 重复创建幂等返回 201", async () => {
    const res = await client.roles.$post({
      json: { name: "tester", description: "测试角色" },
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(body.data.name).toBe("tester")
  })

  it("GET /api/v1/roles — 列出角色", async () => {
    const res = await client.roles.$get()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(1)
  })

  it("GET /api/v1/roles/{id} — 获取单个角色", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":id"].$get({
      param: { id: createdRoleId },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(body.data.name).toBe("tester")
  })

  it("PATCH /api/v1/roles/{id} — 更新角色", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":id"].$patch({
      param: { id: createdRoleId },
      json: { description: "已更新" },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(body.data.description).toBe("已更新")
  })

  it("DELETE /api/v1/roles/{id} — 删除角色", async () => {
    const createRes = await client.roles.$post({
      json: { name: "to-delete", description: "待删除" },
    })
    const deleteId = (await createRes.json()).data.id as string

    const res = await client.roles[":id"].$delete({
      param: { id: deleteId },
    })
    expect(res.status).toBe(204)
  })

  /* ======== 角色权限 ======== */

  it("GET /api/v1/roles/{roleId}/permissions — 空列表", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":roleId"].permissions.$get({
      param: { roleId: createdRoleId },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it("POST /api/v1/roles/{roleId}/permissions — 添加权限", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":roleId"].permissions.$post({
      param: { roleId: createdRoleId },
      json: { permission: "tasks:read" },
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ret).toBe(0)
    expect(body.data.permission).toBe("tasks:read")
  })

  it("POST /api/v1/roles/{roleId}/permissions — 重复添加幂等返回 201", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":roleId"].permissions.$post({
      param: { roleId: createdRoleId },
      json: { permission: "tasks:read" },
    })
    expect(res.status).toBe(201)
  })

  it("GET /api/v1/roles/{roleId}/permissions — 含已添加权限", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":roleId"].permissions.$get({
      param: { roleId: createdRoleId },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    const items = body.data as { permission: string }[]
  })

  it("DELETE /api/v1/roles/{roleId}/permissions/{permission} — 移除权限", async () => {
    if (!createdRoleId) throw new Error("前置：角色未创建")
    const res = await client.roles[":roleId"].permissions[":permission"].$delete(
      {
        param: { roleId: createdRoleId, permission: "tasks:read" },
      },
    )
    expect(res.status).toBe(204)
  })


  /* ======== Zod 校验 ======== */

  it("POST /api/v1/roles — 校验 name 必填", async () => {
    const res = await client.roles.$post({
      // @ts-expect-error 故意缺 name 测试校验
      json: { description: "无名称" },
    })
    expect(res.status).toBe(422)
  })

  it("POST /api/v1/roles/{roleId}/permissions — 校验 permission 格式", async () => {
    const res = await client.roles[":roleId"].permissions.$post({
      param: { roleId: crypto.randomUUID() },
      json: { permission: "invalid" },
    })
    expect(res.status).toBe(422)
  })
})