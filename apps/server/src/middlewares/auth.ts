import { env } from "@better-t-stack-template/env/server"
import { createMiddleware } from "hono/factory"
import { jwtVerify } from "jose"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { isAuthWhitelisted } from "~/lib/auth-whitelist"
import { importPublicKeyFromRow, resolveJwkRow } from "~/lib/jwks-cache"
import type { AppBindings } from "~/lib/type"

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
 * 白名单见 lib/auth-whitelist.ts；JWKS 使用内存缓存（lib/jwks-cache.ts）。
 */
export function authMiddleware() {
  return createMiddleware<AppBindings>(async (c, next) => {
    if (isAuthWhitelisted(c.req.path)) {
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
      const keyRow = await resolveJwkRow(kid)
      if (!keyRow) {
        return c.json(
          { ret: -1, msg: "未登录", data: null },
          HttpStatusCodes.UNAUTHORIZED,
        )
      }

      const publicKey = await importPublicKeyFromRow(keyRow)

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
      })

      c.set("user", payload as unknown as import("~/lib/type").AuthUser)
      return next()
    } catch {
      return c.json(
        { ret: -1, msg: "未登录", data: null },
        HttpStatusCodes.UNAUTHORIZED,
      )
    }
  })
}
