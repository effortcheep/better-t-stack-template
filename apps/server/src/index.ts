import { auth } from "@better-t-stack-template/auth"
import { env } from "@better-t-stack-template/env/server"
import { cors } from "hono/cors"

import createApp from "~/lib/create-app"
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

app.on(["POST", "GET"], "/api/auth/*", (c) =>
  auth.handler(c.req.raw),
)

const routes = [index, tasks] as const

routes.forEach((route) => {
  app.route("/", route)
})

// app.get("/", (c) => {
//   return c.text("OK")
// })

export default app
