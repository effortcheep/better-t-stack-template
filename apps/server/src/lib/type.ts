import type {
  OpenAPIHono,
  RouteConfig,
  RouteHandler,
} from "@hono/zod-openapi"
import type { Schema } from "hono"
import type { PinoLogger } from "hono-pino"

/** JWT payload 注入 c.var.user；sub 为权限系统用户 ID (#53) */
export type AuthUser = {
  sub: string
  [key: string]: unknown
}

export interface AppBindings {
  Variables: {
    logger: PinoLogger
    user?: AuthUser
  }
}

export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<
  AppBindings,
  S
>

export type AppRouteHandler<R extends RouteConfig> =
  RouteHandler<R, AppBindings>
