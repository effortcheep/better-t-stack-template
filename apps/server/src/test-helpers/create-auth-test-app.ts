import type { Schema } from "hono"

import { createRouter, createTestApp } from "~/lib/create-app"
import type { AppOpenAPI } from "~/lib/type"
import { testAuthMiddleware } from "./test-auth"

/** 集成测试用：注入用户上下文后挂载路由 */
export function createAuthTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  const authed = createRouter()
    .use("*", testAuthMiddleware())
    .route("/", router) as unknown as AppOpenAPI<S>
  return createTestApp(authed)
}
