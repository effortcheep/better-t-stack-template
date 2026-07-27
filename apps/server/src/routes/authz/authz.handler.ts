import { and, db, eq, sql, desc, asc } from "@better-t-stack-template/db"
import {
  roles,
  rolePermissions,
} from "@better-t-stack-template/db/schema/authz"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { created, err, noContent, ok } from "~/lib/response-helpers"
import {
  clearRolePermissions,
} from "~/services/permission-cache"
import { getAllPermissionModules } from "~/services/permission-registry"
import type { AppRouteHandler } from "~/lib/type"

import * as routes from "./authz.routes"

/* ---- 角色 CRUD ---- */

export const listRoles: AppRouteHandler<typeof routes.listRoles> = async (c) => {
  const { page, pageSize, sort, order } = c.req.valid("query")

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(roles)
  const total = countResult[0]?.count ?? 0

  const sortColumn = roles[sort as "createdAt"] ?? roles.createdAt

  const items = await db
    .select()
    .from(roles)
    .orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return ok(c, { items, total, page, pageSize })
}

export const createRole: AppRouteHandler<typeof routes.createRole> = async (c) => {
  const body = c.req.valid("json")

  const [existing] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, body.name))
  if (existing) {
    return err(c, "角色名称已存在", HttpStatusCodes.CONFLICT)
  }

  const id = crypto.randomUUID()
  await db.insert(roles).values({ id, ...body })
  const [item] = await db.select().from(roles).where(eq(roles.id, id))
  return created(c, item!)
}

export const getRole: AppRouteHandler<typeof routes.getRole> = async (c) => {
  const { id } = c.req.valid("param")
  const [item] = await db.select().from(roles).where(eq(roles.id, id))
  return ok(c, item ?? null)
}

export const updateRole: AppRouteHandler<typeof routes.updateRole> = async (c) => {
  const { id } = c.req.valid("param")
  const body = c.req.valid("json")
  const [updated] = await db
    .update(roles)
    .set(body)
    .where(eq(roles.id, id))
    .returning()
  return ok(c, updated ?? null)
}

export const deleteRole: AppRouteHandler<typeof routes.deleteRole> = async (c) => {
  const { id } = c.req.valid("param")
  const result = await db.delete(roles).where(eq(roles.id, id))
  if (result.rowCount === 0) {
    return err(c, "角色不存在", HttpStatusCodes.NOT_FOUND)
  }
  clearRolePermissions(id).catch((e) =>
    c.var.logger.warn(e, "清除角色权限缓存失败"),
  )
  return noContent(c)
}

/* ---- 角色权限 ---- */

export const listRolePermissions: AppRouteHandler<
  typeof routes.listRolePermissions
> = async (c) => {
  const { roleId } = c.req.valid("param")
  const items = await db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId))
  return ok(c, items)
}

export const addRolePermission: AppRouteHandler<
  typeof routes.addRolePermission
> = async (c) => {
  const { roleId } = c.req.valid("param")
  const { permission } = c.req.valid("json")

  const existing = await db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permission, permission),
      ),
    )
  if (existing.length > 0) {
    return err(c, "权限已存在", HttpStatusCodes.CONFLICT)
  }

  const id = crypto.randomUUID()
  await db.insert(rolePermissions).values({ id, roleId, permission })
  clearRolePermissions(roleId).catch((e) =>
    c.var.logger.warn(e, "清除角色权限缓存失败"),
  )
  const [item] = await db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.id, id))
  return created(c, item!)
}

export const removeRolePermission: AppRouteHandler<
  typeof routes.removeRolePermission
> = async (c) => {
  const { roleId, permission } = c.req.valid("param")
  const result = await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permission, permission),
      ),
    )
  if (result.rowCount === 0) {
    return err(c, "权限项不存在", HttpStatusCodes.NOT_FOUND)
  }
  clearRolePermissions(roleId).catch((e) =>
    c.var.logger.warn(e, "清除角色权限缓存失败"),
  )
  return noContent(c)
}

/* ---- 权限码管理 ---- */

export const listAllPermissions: AppRouteHandler<
  typeof routes.listAllPermissions
> = async (c) => {
  return ok(c, getAllPermissionModules())
}