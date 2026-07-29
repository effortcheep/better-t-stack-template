import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppBindings } from "~/lib/type"
import { hasPermission } from "~/lib/permissions"
import { getUserPermissions } from "~/services/permission-cache"

export type PermissionRule = {
  methods: string[]
  /** 匹配 c.req.path（完整路径，含 /api/v1 前缀） */
  path: RegExp
  permission: string
}

export type PermissionGuardOptions = {
  /**
   * 自定义权限满足判定。默认使用 hasPermission（含 *:*）。
   * authz 模块可传入 roles:manage 覆盖逻辑。
   */
  satisfies?: (
    permissions: ReadonlySet<string>,
    required: string,
  ) => boolean
  /** 无规则匹配时的行为。默认拒绝（返回 403）。 */
  defaultDeny?: boolean
}

const defaultSatisfies = (
  permissions: ReadonlySet<string>,
  required: string,
) => hasPermission(permissions, required)

/**
 * 按 method + path 规则表校验权限。规则按数组顺序匹配，先匹配先生效。
 */
export function createPermissionGuard(
  rules: PermissionRule[],
  options: PermissionGuardOptions = {},
) {
  const satisfies = options.satisfies ?? defaultSatisfies
  const defaultDeny = options.defaultDeny ?? true

  return createMiddleware<AppBindings>(async (c, next) => {
    const userId = c.var.user?.sub as string | undefined
    if (!userId) {
      return c.json(
        { ret: -1, msg: "未登录", data: null },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }

    const method = c.req.method.toUpperCase()
    const path = c.req.path

    const rule = rules.find(
      (r) =>
        r.methods.map((m) => m.toUpperCase()).includes(method) &&
        r.path.test(path),
    )

    if (!rule) {
      if (!defaultDeny) return next()
      return c.json(
        { ret: -1, msg: "权限不足", data: null },
        HttpStatusCodes.FORBIDDEN,
      )
    }

    const permissions = await getUserPermissions(userId)
    if (!satisfies(new Set(permissions), rule.permission)) {
      c.var.logger?.warn(
        {
          userId,
          path,
          method,
          required: rule.permission,
        },
        "权限拒绝",
      )
      return c.json(
        { ret: -1, msg: "权限不足", data: null },
        HttpStatusCodes.FORBIDDEN,
      )
    }

    return next()
  })
}

/** 标准 CRUD 资源权限规则（路径段如 tasks、projects） */
export function crudPermissionRules(
  segment: string,
  resource: string,
): PermissionRule[] {
  const base = new RegExp(`/${segment}/?$`)
  const byId = new RegExp(`/${segment}/[^/]+/?$`)
  return [
    { methods: ["GET"], path: base, permission: `${resource}:read` },
    { methods: ["POST"], path: base, permission: `${resource}:create` },
    { methods: ["GET"], path: byId, permission: `${resource}:read` },
    { methods: ["PATCH"], path: byId, permission: `${resource}:update` },
    { methods: ["DELETE"], path: byId, permission: `${resource}:delete` },
  ]
}
