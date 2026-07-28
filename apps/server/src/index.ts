import { auth } from "@better-t-stack-template/auth"
import { env } from "@better-t-stack-template/env/server"
import { cors } from "hono/cors"
import { readdir } from "node:fs/promises"
import { join } from "node:path"

import createApp from "~/lib/create-app"
import { authMiddleware } from "~/middlewares/auth"
import index from "~/routes/index.route"
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
// Keep backward-compatible behavior: also expose the index router at /api/v1/.
app.route("/api/v1", index)

async function collectRouteModulePaths(
  absDir: string,
  relPrefix = "./routes",
): Promise<string[]> {
  const entries = await readdir(absDir, { withFileTypes: true })
  const modules: string[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nextAbsDir = join(absDir, entry.name)
      const nextRelPrefix = `${relPrefix}/${entry.name}`
      modules.push(...await collectRouteModulePaths(nextAbsDir, nextRelPrefix))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".index.ts")) {
      modules.push(`${relPrefix}/${entry.name}`)
    }
  }

  return modules
}

// Auto-load all feature routers:
// - routes/admin/**/*.index.ts   -> mounted at /api/v1/admin
// - routes/**/*.index.ts (others) -> mounted at /api/v1
const routeModules = await collectRouteModulePaths(
  join(import.meta.dir, "routes"),
)

for (const routeModulePath of routeModules) {
  const mod = await import(routeModulePath)
  const router = (mod as { default?: unknown }).default
  if (!router) continue

  const mount = routeModulePath.includes("/admin/")
    ? "/api/v1/admin"
    : "/api/v1"

  app.route(mount, router as never)
}

export default app