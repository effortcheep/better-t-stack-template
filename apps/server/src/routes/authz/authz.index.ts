import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppBindings } from "~/lib/type"
import { hasPermission } from "~/lib/permissions"
import { getUserPermissions } from "~/services/permission-cache"

import { createRouter } from "~/lib/create-app"
import * as handlers from "./authz.handler"
import * as routes from "./authz.routes"

/**
 * 按请求路径和方法判定所需权限码，然后校验。
 * 权限不足 → 403，否则放行。
 */
const authzGuard = createMiddleware<AppBindings>(async (c, next) => {
  const userId = c.var.user?.sub as string | undefined
  if (!userId) {
    return c.json(
      { ret: -1, msg: "未登录", data: null },
      HttpStatusCodes.UNAUTHORIZED,
    )
  }

  const method = c.req.method
  const path = c.req.path

  /* 权限码判定表（按路径特征） */
  const perm = authzPermission(method, path)
  if (!perm) return next() // 非 authz 路径，放行

  const permissions = await getUserPermissions(userId)
  if (!hasRolePermission(new Set(permissions), perm)) {
    return c.json(
      { ret: -1, msg: "权限不足", data: null },
      HttpStatusCodes.FORBIDDEN,
    )
  }

  return next()
})

/** 根据 method + path 返回所需权限码，无法判定时返回 null（放行） */
function authzPermission(method: string, path: string): string | null {
  /* /roles */
  if (path.endsWith("/roles")) {
    return method === "GET" ? "roles:read" : "roles:create"
  }
  /* /roles/:id */
  if (path.match(/\/roles\/[^/]+\/?$/)) {
    if (method === "GET") return "roles:read"
    if (method === "PATCH") return "roles:update"
    if (method === "DELETE") return "roles:delete"
  }
  /* /roles/:roleId/permissions */
  if (path.match(/\/roles\/[^/]+\/permissions\/?$/)) {
    return method === "GET" ? "roles:read" : "roles:update"
  }
  /* /roles/:roleId/permissions/:id */
  if (path.match(/\/roles\/[^/]+\/permissions\/[^/]+/)) {
    return "roles:update"
  }

  return null
}

/** 持有 roles:manage 即可覆盖所有角色操作 */
function hasRolePermission(permissions: ReadonlySet<string>, target: string): boolean {
  return hasPermission(permissions, target) || permissions.has("roles:manage")
}

const router = createRouter()
router.use("/roles", authzGuard)
router.use("/roles/*", authzGuard)

/* 路由注册 */
router
  /* 角色 */
  .openapi(routes.listRoles, handlers.listRoles)
  .openapi(routes.createRole, handlers.createRole)
  .openapi(routes.getRole, handlers.getRole)
  .openapi(routes.updateRole, handlers.updateRole)
  .openapi(routes.deleteRole, handlers.deleteRole)
  /* 角色权限 */
  .openapi(routes.listRolePermissions, handlers.listRolePermissions)
  .openapi(routes.addRolePermission, handlers.addRolePermission)
  .openapi(
    routes.removeRolePermission,
    handlers.removeRolePermission,
  )
  /* 权限码列表 */
  .openapi(routes.listAllPermissions, handlers.listAllPermissions)

export default router