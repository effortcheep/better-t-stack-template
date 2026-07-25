import { db } from "@better-t-stack-template/db"
import { jwks } from "@better-t-stack-template/db/schema/auth"
import { env } from "@better-t-stack-template/env/server"
import { createMiddleware } from "hono/factory"
import { importJWK, jwtVerify } from "jose"
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

/** 解码 JWT 的 kid */
function getKid(token: string): string | null {
  try {
    const header = token.split(".")[0]
    if (!header) return null
    const json = atob(header.replace(/-/g, "+").replace(/_/g, "/"))
    return (JSON.parse(json) as { kid?: string }).kid ?? null
  } catch {
    return null
  }
}

/**
 * JWT Bearer 认证中间件
 *
 * 从 Authorization: Bearer <jwt> 提取 JWT，用 jose + jwks 表验签，
 * 验签通过后将 payload 注入 c.var.user 供下游 handler 使用。
 */
export function authMiddleware() {
  return createMiddleware<AppBindings>(async (c, next) => {
    if (AUTH_WHITELIST.includes(c.req.path)) {
      return next()
    }

    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json(
        { ret: -1, msg: "未登录", data: null },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }

    const token = authHeader.slice(7)
    const kid = getKid(token)

    try {
      const keys = await db.select().from(jwks)

      // 优先按 kid 匹配，否则尝试所有 key
      let keyRow = keys.find((k) => k.id === kid)
      if (!keyRow) {
        // 取最新创建的 key
        keyRow = keys.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
      }
      if (!keyRow) {
        return c.json(
          { ret: -1, msg: "未登录", data: null },
          HttpStatusCodes.UNAUTHORIZED,
        )
      }

      const jwk = JSON.parse(keyRow.publicKey) as { alg?: string }
      const publicKey = await importJWK(jwk, jwk.alg || "EdDSA")

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
      })

      c.set("user", payload as unknown as Record<string, unknown>)
      return next()
    } catch {
      return c.json(
        { ret: -1, msg: "未登录", data: null },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }
  })
}