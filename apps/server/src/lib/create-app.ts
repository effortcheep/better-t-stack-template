import { OpenAPIHono } from "@hono/zod-openapi"
import type { Schema } from "hono"
import { requestId } from "hono/request-id"
import { serveEmojiFavicon } from "stoker/middlewares"

import notFound from "~/middlewares/not-found"
import onError from "~/middlewares/on-error"

import defaultHook from "~/lib/default-hook"

import { pinoLogger } from "~/middlewares/pino-logger"

import type { AppBindings, AppOpenAPI } from "./type"

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  })
}

export default function createApp() {
  const app = createRouter()
  app
    .use(requestId())
    .use(serveEmojiFavicon("📝"))
    .use(pinoLogger())

  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp<S extends Schema>(
  router: AppOpenAPI<S>,
) {
  return createApp().route("/", router)
}
