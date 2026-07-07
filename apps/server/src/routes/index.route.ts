import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { jsonContent } from "stoker/openapi/helpers"
import { createMessageObjectSchema } from "stoker/openapi/schemas"

import { createRouter } from "~/lib/create-app"
import type { AppRouteHandler } from "~/lib/type"

const route = createRoute({
  tags: ["Index"],
  method: "get",
  path: "/",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("Template API"),
      "Template API Index",
    ),
  },
})

const handler: AppRouteHandler<typeof route> = (c) => {
  return c.json(
    {
      message: "Template API",
    },
    HttpStatusCodes.OK,
  )
}

const router = createRouter().openapi(route, handler)

export default router
