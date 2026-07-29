import { createMiddleware } from "hono/factory"

import type { AppBindings } from "~/lib/type"

/** 集成测试中注入已登录用户上下文 */
export function testAuthMiddleware(userId = "00000000-0000-0000-0000-000000000001") {
  return createMiddleware<AppBindings>(async (c, next) => {
    c.set("user", { sub: userId })
    await next()
  })
}
