import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { db, sql } from "@better-t-stack-template/db"
import { roles } from "@better-t-stack-template/db/schema/authz"
import { testClient } from "hono/testing"
import {
  describe,
  beforeAll,
  afterAll,
  it,
  expect,
} from "vitest"

import { createTestApp } from "~/lib/create-app"

import adminRouter from "./admin.index"

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

if (process.env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'")
}

const client = testClient(createTestApp(adminRouter))

type ApiEnvelope<T> = {
  ret: number
  msg: string
  data: T | null
}

type CreatedUser = {
  id: string
  name: string
  email: string
  username: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  roles: Array<{ id: string; name: string }>
}

type UserListPage = {
  items: Array<{ name: string }>
  total: number
  page: number
  pageSize: number
}

type UserDetail = {
  id: string
  email: string
  name: string
  roles: unknown[]
}

type Role = {
  name: string
}

function expectData<T>(body: ApiEnvelope<T>): T {
  expect(body.data).not.toBeNull()
  return body.data as T
}

describe("admin routes", () => {
  let testUserId: string
  let testRoleId: string

  beforeAll(async () => {
    execSync("bun db:push", {
      cwd: root,
      env: {
        ...process.env,
        DOTENV_CONFIG_PATH: path.resolve(
          root,
          "apps/server/.env.test",
        ),
      },
    })
    await db.execute(
      sql`TRUNCATE TABLE user_roles, role_permissions, roles, account, "user" CASCADE`,
    )

    // 创建测试角色
    const rid = crypto.randomUUID()
    await db.insert(roles).values({
      id: rid,
      name: "admin",
      description: "管理员",
    })
    testRoleId = rid
  })

  afterAll(async () => {
    await db.execute(
      sql`TRUNCATE TABLE user_roles, role_permissions, roles, account, "user" CASCADE`,
    )
  })

  /* ======== 用户管理 ======== */

  it("POST /users — 创建用户", async () => {
    const email = `test-${crypto.randomUUID().slice(0, 8)}@example.com`
    const res = await client.users.$post({
      json: {
        email,
        password: "password123",
        name: "测试用户",
        username: `test_${crypto.randomUUID().slice(0, 8)}`,
      },
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as ApiEnvelope<CreatedUser>
    expect(body.ret).toBe(0)
    const data = expectData(body)
    expect(data).toHaveProperty("id")
    expect(data.email).toBe(email)
    expect(data.name).toBe("测试用户")
    expect(data.roles).toEqual([])
    testUserId = data.id
  })

  it("POST /users — 重复邮箱返回错误", async () => {
    const email = `dup-${crypto.randomUUID().slice(0, 8)}@example.com`
    // 第一次创建
    const res1 = await client.users.$post({
      json: {
        email,
        password: "password123",
        name: "重复用户",
        username: `dup_${crypto.randomUUID().slice(0, 8)}`,
      },
    })
    expect(res1.status).toBe(201)

    // 第二次创建同一邮箱
    const res2 = await client.users.$post({
      json: {
        email,
        password: "password456",
        name: "重复用户2",
        username: `dup2_${crypto.randomUUID().slice(0, 8)}`,
      },
    })
    const body2 = (await res2.json()) as ApiEnvelope<null>
    expect(res2.status).toBe(200)
    expect(body2.ret).toBe(-1)
    expect(body2.msg).toBeTruthy()
    expect(body2.data).toBeNull()
  })

  it("GET /users — 分页列表", async () => {
    const res = await client.users.$get({
      query: { page: "1", pageSize: "10" },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as ApiEnvelope<UserListPage>
    expect(body.ret).toBe(0)
    const data = expectData(body)
    expect(data).toHaveProperty("items")
    expect(data).toHaveProperty("total")
    expect(data).toHaveProperty("page", 1)
    expect(data).toHaveProperty("pageSize", 10)
    expect(Array.isArray(data.items)).toBe(true)
  })

  it("GET /users — 空列表时 total=0", async () => {
    // 清空所有用户后验证
    await db.execute(
      sql`TRUNCATE TABLE user_roles, account, "user" CASCADE`,
    )
    const res = await client.users.$get({
      query: { page: "1", pageSize: "10" },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as ApiEnvelope<UserListPage>
    expect(body.ret).toBe(0)
    const data = expectData(body)
    expect(data.total).toBe(0)
    expect(data.items).toEqual([])

    // 恢复：重新创建一个测试用户供后续用例使用
    const email = `search-${crypto.randomUUID().slice(0, 8)}@example.com`
    const createRes = await client.users.$post({
      json: {
        email,
        password: "password123",
        name: "搜索测试",
        username: "search_test",
      },
    })
    testUserId = expectData(
      (await createRes.json()) as ApiEnvelope<CreatedUser>,
    ).id
  })

  it("GET /users — 搜索功能", async () => {
    const res = await client.users.$get({
      query: {
        page: "1",
        pageSize: "10",
        search: "search_test",
      },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as ApiEnvelope<UserListPage>
    expect(body.ret).toBe(0)
    const data = expectData(body)
    expect(data.items.length).toBeGreaterThanOrEqual(1)
    const names = data.items.map((item) => item.name)
    expect(names).toContain("搜索测试")
  })

  it("GET /users/{id} — 获取用户详情", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    const res = await client.users[":id"].$get({
      param: { id: testUserId },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as ApiEnvelope<UserDetail>
    expect(body.ret).toBe(0)
    const data = expectData(body)
    expect(data.id).toBe(testUserId)
    expect(data).toHaveProperty("email")
    expect(data).toHaveProperty("name")
    expect(data).toHaveProperty("roles")
    expect(Array.isArray(data.roles)).toBe(true)
  })

  it("GET /users/{id} — 不存在的用户", async () => {
    const res = await client.users[":id"].$get({
      param: { id: crypto.randomUUID() },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ret).toBe(-1)
    expect(body.msg).toBe("用户不存在")
    expect(body.data).toBeNull()
  })

  it("POST /users/{id}/change-password — 修改密码", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    const res = await client.users[":id"][
      "change-password"
    ].$post({
      param: { id: testUserId },
      json: { password: "newpassword123" },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ret).toBe(0)
  })

  it("POST /users/{id}/change-password — 短密码验证失败", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    const res = await client.users[":id"][
      "change-password"
    ].$post({
      param: { id: testUserId },
      json: { password: "short" },
    })
    expect(res.status).toBe(422)
  })

  /* ======== 用户角色 ======== */

  it("GET /users/{userId}/roles — 列出角色（空）", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    const res = await client.users[":userId"].roles.$get({
      param: { userId: testUserId },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as ApiEnvelope<Role[]>
    expect(body.ret).toBe(0)
    const data = expectData(body)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(0)
  })

  it("POST /users/{userId}/roles — 分配角色", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    if (!testRoleId) throw new Error("前置：角色未创建")
    const res = await client.users[":userId"].roles.$post({
      param: { userId: testUserId },
      json: { roleId: testRoleId },
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as ApiEnvelope<Role>
    expect(body.ret).toBe(0)
    expect(expectData(body).name).toBe("admin")
  })

  it("POST /users/{userId}/roles — 幂等分配已存在角色", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    if (!testRoleId) throw new Error("前置：角色未创建")
    const res = await client.users[":userId"].roles.$post({
      param: { userId: testUserId },
      json: { roleId: testRoleId },
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as ApiEnvelope<Role>
    expect(body.ret).toBe(0)
    expect(expectData(body).name).toBe("admin")
  })

  it("DELETE /users/{userId}/roles/{roleId} — 撤销角色", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    if (!testRoleId) throw new Error("前置：角色未创建")
    const res = await client.users[":userId"].roles[
      ":roleId"
    ].$delete({
      param: { userId: testUserId, roleId: testRoleId },
    })
    expect(res.status).toBe(204)
  })

  it("DELETE /users/{userId}/roles/{roleId} — 撤销不存在的角色", async () => {
    if (!testUserId) throw new Error("前置：用户未创建")
    const res = await client.users[":userId"].roles[
      ":roleId"
    ].$delete({
      param: {
        userId: testUserId,
        roleId: crypto.randomUUID(),
      },
    })
    // unassignUserRole 返回 err() => status 404 with JSON body
    expect(res.status).toBe(404)
    const body = (await res.json()) as ApiEnvelope<null>
    expect(body.ret).toBe(-1)
    expect(body.msg).toBe("用户角色项不存在")
    expect(body.data).toBeNull()
  })
})

