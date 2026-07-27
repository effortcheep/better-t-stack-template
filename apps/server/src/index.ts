import { auth } from "@better-t-stack-template/auth"
import { env } from "@better-t-stack-template/env/server"
import { cors } from "hono/cors"

import createApp from "~/lib/create-app"
import { authMiddleware } from "~/middlewares/auth"
import authRoutes from "~/routes/auth/auth.index"
import adminRoutes from "~/routes/admin/admin.index"
import authzRoutes from "~/routes/authz/authz.index"
import meRoutes from "~/routes/me/me.index"
import index from "~/routes/index.route"
import tasks from "~/routes/tasks/tasks.index"
import { initPermissionRegistry } from "~/services/permission-registry"

import configureOpenAPI from "./lib/configure-open-api"

// 启动时扫描各模块 permission.json
await initPermissionRegistry()

const app = createApp()

configureOpenAPI(app)

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

app.use("/api/v1/*", authMiddleware())

// jwt 插件端点委托给 better-auth 原生 handler
app.on(["GET"], "/api/v1/auth/jwks", (c) =>
  auth.handler(c.req.raw),
)
app.on(["POST", "GET"], "/api/v1/auth/token", (c) =>
  auth.handler(c.req.raw),
)

app.route("/", index)
app.route("/api/v1/admin", adminRoutes)

const routes = [index, tasks, authRoutes, authzRoutes, meRoutes] as const
routes.forEach((route) => {
  app.route("/api/v1", route)
})

export default app