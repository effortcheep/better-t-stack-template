import { auth } from "@better-t-stack-template/auth"
import { APIError } from "better-auth"
import { hashPassword } from "better-auth/crypto"
import { and, asc, count, db, desc, eq, ilike, inArray, or } from "@better-t-stack-template/db"
import { user, account } from "@better-t-stack-template/db/schema/auth"
import {
  roles,
  userRoles,
} from "@better-t-stack-template/db/schema/authz"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { created, err, noContent, ok } from "~/lib/response-helpers"
import {
  clearUserPermissions,
} from "~/services/permission-cache"
import type { AppRouteHandler } from "~/lib/type"

import type {
  AssignUserRoleRoute,
  CreateUserRoute,
  ListUserRolesRoute,
  ListUsersRoute,
  UnassignUserRoleRoute,
  GetUserRoute,
  ChangePasswordRoute,
} from "./admin.routes"

// ============================================================
// 用户列表
// ============================================================

export const listUsers: AppRouteHandler<ListUsersRoute> = async (c) => {
  const { page, pageSize, sort, order, search } = c.req.valid("query")

  const orderFn = order === "asc" ? asc : desc
  const sortColumn = sort === "createdAt" ? user.createdAt : user.updatedAt

  // 构建搜索条件
  const conditions = []
  if (search) {
    conditions.push(
      or(
        ilike(user.email, `%${search}%`),
        ilike(user.username, `%${search}%`),
      ),
    )
  }

  // 分页用户查询
  const users = await db.query.user.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: orderFn(sortColumn),
  })

  // 总数
  const [totalRow] = await db
    .select({ total: count() })
    .from(user)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  // 批量取角色
  const userIds = users.map((u) => u.id)
  const rolesByUser: Record<string, { id: string; name: string }[]> = {}
  if (userIds.length > 0) {
    const userRoleRows = await db
      .select({
        userId: userRoles.userId,
        roleId: roles.id,
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(inArray(userRoles.userId, userIds))
    for (const row of userRoleRows) {
      if (!rolesByUser[row.userId]) rolesByUser[row.userId] = []
      rolesByUser[row.userId]!.push({ id: row.roleId, name: row.roleName })
    }
  }

  const items = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username ?? null,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
    roles: rolesByUser[u.id] ?? [],
  }))

  return ok(c, {
    items,
    total: totalRow?.total ?? 0,
    page,
    pageSize,
  })
}

// ============================================================
// 创建用户
// ============================================================

export const createUser: AppRouteHandler<
  CreateUserRoute
> = async (c) => {
  const body = c.req.valid("json")

  try {
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: body.email,
        name: body.name,
        password: body.password,
        username: body.username,
      },
      asResponse: true,
    })

    if (!signUpRes.ok) {
      const errData = (await signUpRes
        .clone()
        .json()
        .catch(() => ({ message: "" }))) as {
        message?: string
      }
      return c.json(
        {
          ret: -1,
          msg:
            errData.message ||
            "创建失败，邮箱或用户名可能已被使用",
          data: null,
        },
        HttpStatusCodes.OK,
      )
    }

    // 从 better-auth 响应中提取 user ID
    const signUpData = (await signUpRes.clone().json()) as {
      user?: { id: string }
    }
    const userId = signUpData?.user?.id
    if (!userId) {
      return c.json(
        { ret: -1, msg: "创建成功但无法获取用户 ID", data: null },
        HttpStatusCodes.OK,
      )
    }

    // 查询完整用户信息
    const [u] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))

    if (!u) {
      return c.json(
        { ret: -1, msg: "用户创建后无法查询", data: null },
        HttpStatusCodes.OK,
      )
    }

    return created(c, {
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username ?? null,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      roles: [],
    })
  } catch (err_) {
    if (err_ instanceof APIError) {
      return c.json(
        { ret: -1, msg: err_.message, data: null },
        HttpStatusCodes.OK,
      )
    }
    c.var.logger.error(err_, "创建用户失败")
    return c.json(
      { ret: -1, msg: "服务器内部错误", data: null },
      HttpStatusCodes.OK,
    )
  }
}

// ============================================================
// 用户详情
// ============================================================

export const getUser: AppRouteHandler<GetUserRoute> = async (c) => {
  const { id } = c.req.valid("param")

  const [u] = await db.select().from(user).where(eq(user.id, id))
  if (!u) {
    return c.json(
      { ret: -1, msg: "用户不存在", data: null },
      HttpStatusCodes.OK,
    )
  }

  // 查询角色（含完整角色信息）
  const userRoleRows = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      createdAt: roles.createdAt,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, id))

  return ok(c, {
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username ?? null,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    roles: userRoleRows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.createdAt.toISOString(),
    })),
  })
}

// ============================================================
// 修改密码
// ============================================================

export const changePassword: AppRouteHandler<
  ChangePasswordRoute
> = async (c) => {
  const { id } = c.req.valid("param")
  const { password } = c.req.valid("json")

  // 验证用户存在
  const [u] = await db.select().from(user).where(eq(user.id, id))
  if (!u) {
    return c.json(
      { ret: -1, msg: "用户不存在", data: null },
      HttpStatusCodes.OK,
    )
  }

  // 查找 credential 账号
  const accounts = await db
    .select()
    .from(account)
    .where(
      and(
        eq(account.userId, id),
        eq(account.providerId, "credential"),
      ),
    )

  const hashed = await hashPassword(password)

  if (accounts.length > 0 && accounts[0]?.password) {
    // 已有密码 — 更新
    await db
      .update(account)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(account.id, accounts[0].id))
  } else {
    // 无密码账号 — 创建新 credential 记录
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: id,
      accountId: id,
      providerId: "credential",
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  // 清除权限缓存
  clearUserPermissions(id).catch((e) =>
    c.var.logger.warn(e, "清除用户权限缓存失败"),
  )

  return c.json({ ret: 0, msg: "ok", data: null }, HttpStatusCodes.OK)
}

// ============================================================
// 用户角色（从 authz 迁移）
// ============================================================

export const listUserRoles: AppRouteHandler<
  ListUserRolesRoute
> = async (c) => {
  const { userId } = c.req.valid("param")
  const items = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      createdAt: roles.createdAt,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
  return ok(c, items)
}

export const assignUserRole: AppRouteHandler<
  AssignUserRoleRoute
> = async (c) => {
  const { userId } = c.req.valid("param")
  const { roleId } = c.req.valid("json")

  // 幂等 — 已存在则返回已有记录
  const existing = await db
    .select()
    .from(userRoles)
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    )
  if (existing.length > 0) {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
    return created(c, role!)
  }

  const id = crypto.randomUUID()
  await db.insert(userRoles).values({ id, userId, roleId })
  clearUserPermissions(userId).catch((e) =>
    c.var.logger.warn(e, "清除用户权限缓存失败"),
  )
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.id, roleId))
  return created(c, role!)
}

export const unassignUserRole: AppRouteHandler<
  UnassignUserRoleRoute
> = async (c) => {
  const { userId, roleId } = c.req.valid("param")
  const result = await db
    .delete(userRoles)
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    )
  if (result.rowCount === 0) {
    return err(c, "用户角色项不存在", HttpStatusCodes.NOT_FOUND)
  }
  clearUserPermissions(userId).catch((e) =>
    c.var.logger.warn(e, "清除用户权限缓存失败"),
  )
  return noContent(c)
}