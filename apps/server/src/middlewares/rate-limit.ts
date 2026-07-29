import { createMiddleware } from "hono/factory"
import * as HttpStatusCodes from "stoker/http-status-codes"

import type { AppBindings } from "~/lib/type"

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * 简易内存限流 — 适用于单实例 / 开发环境 (#58)。
 * 生产多实例应换 Redis 实现。
 */
export function rateLimit(options: {
  windowMs?: number
  max?: number
  keyPrefix?: string
}) {
  const windowMs = options.windowMs ?? 60_000
  const max = options.max ?? 20
  const keyPrefix = options.keyPrefix ?? "rl"

  return createMiddleware<AppBindings>(async (c, next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      "unknown"
    const key = `${keyPrefix}:${ip}:${c.req.path}`
    const now = Date.now()

    let bucket = buckets.get(key)
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(key, bucket)
    }

    bucket.count += 1
    if (bucket.count > max) {
      return c.json(
        { ret: -1, msg: "请求过于频繁，请稍后再试", data: null },
        HttpStatusCodes.TOO_MANY_REQUESTS,
      )
    }

    return next()
  })
}
