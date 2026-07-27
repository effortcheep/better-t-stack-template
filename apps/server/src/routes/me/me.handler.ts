import { ok } from "~/lib/response-helpers"
import type { AppRouteHandler } from "~/lib/type"

import { getUserPermissions } from "~/services/permission-cache"

import type { GetMePermissionsRoute } from "./me.routes"

export const getMePermissions: AppRouteHandler<
  GetMePermissionsRoute
> = async (c) => {
  /* JWT payload 的 sub 字段 = 用户 ID */
  const userId = c.var.user?.sub as string | undefined
  if (!userId) {
    return ok(c, [])
  }

  const permissions = await getUserPermissions(userId)
  return ok(c, permissions)
}