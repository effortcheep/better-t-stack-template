import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { jsonContent } from "~/lib/response-helpers"

const tags = ["Me"]

export const getMePermissions = createRoute({
  path: "/me/permissions",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(z.string()),
      "当前用户权限码列表",
    ),
  },
})

export type GetMePermissionsRoute = typeof getMePermissions