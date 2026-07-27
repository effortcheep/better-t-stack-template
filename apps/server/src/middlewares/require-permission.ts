import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"
import type { Context } from "hono"

import type { AppBindings } from "~/lib/type"
import { hasPermission } from "~/lib/permissions"
import { getUserPermissions } from "~/services/permission-cache"

/**
 * 权限校验中间件。
 *
 * @param perms 需要的权限码 — OR 逻辑：用户满足任意一个即放行
 *
 * 行为：
 *  1. 从 c.var.user.sub 获取当前用户 ID
 *  2. 从 Redis 缓存读取权限列表（缓存优先，未命中查库）
 *  3. 用 hasPermission 检查是否满足
 *  4. 满足 → next()；不满足 → 403 信封
 *
 * 要求：必须位于 authMiddleware 之后（c.var.user 已注入）。
 */
export function requirePermission(...perms: string[]) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const userId = c.var.user?.sub as string | undefined
    if (!userId) {
      return c.json(
        { ret: -1, msg: "未登录", data: null },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }

    const permissions = await getUserPermissions(userId)

    const allowed = perms.some((p) =>
      hasPermission(new Set(permissions), p),
    )

    if (!allowed) {
      return c.json(
        { ret: -1, msg: "权限不足", data: null },
        HttpStatusCodes.FORBIDDEN,
      )
    }

    return next()
  })
}

/**
 * 为当前请求预取用户权限。
 *
 * 用于 handler 中需要权限判断的转发逻辑，避免 repeat 查缓存。
 * 要求 c.var.user 已由 authMiddleware 注入。
 */
export async function prefetchPermissions(
  c: Context<AppBindings>,
): Promise<string[]> {
  const userId = c.var.user?.sub as string | undefined
  if (!userId) return []
  return getUserPermissions(userId)
}