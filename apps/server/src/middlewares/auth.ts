import { auth } from "@better-t-stack-template/auth"
import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppBindings } from "~/lib/type"

/** 无需认证即可访问的端点白名单 */
const AUTH_WHITELIST = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/check-username",
  "/api/v1/auth/token",
  "/api/v1/auth/jwks",
]

/**
 * Bearer Token 认证中间件
 *
 * 保护 /api/v1/* 路由，白名单放行公开端点。
 * 通过 auth.api.getSession 验证 Authorization: Bearer <token>。
 */
export function authMiddleware() {
  return createMiddleware<AppBindings>(async (c, next) => {
    if (AUTH_WHITELIST.includes(c.req.path)) {
      return next()
    }

    const sessionResult = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!sessionResult || !("session" in sessionResult)) {
      return c.json(
        { ret: -1, msg: "未登录", data: null },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }

    return next()
  })
}