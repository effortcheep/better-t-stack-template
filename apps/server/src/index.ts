import { auth } from "@better-t-stack-template/auth"
import { env } from "@better-t-stack-template/env/server"
import { cors } from "hono/cors"

import createApp from "~/lib/create-app"
import { authMiddleware } from "~/middlewares/auth"
import authRoutes from "~/routes/auth/auth.index"
import index from "~/routes/index.route"
import tasks from "~/routes/tasks/tasks.index"

import configureOpenAPI from "./lib/configure-open-api"

const app = createApp()

configureOpenAPI(app)

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
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

const routes = [index, tasks, authRoutes] as const
routes.forEach((route) => {
  app.route("/api/v1", route)
})

// app.get("/", (c) => {
//   return c.text("OK")
// })

export default app
