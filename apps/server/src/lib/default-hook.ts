/**
 * 信封版 Zod 校验 Hook
 *
 * 从 stoker 的 defaultHook 改编，响应格式从 { success, error } 改为信封 { ret, msg, data }。
 */

import type { Hook } from "@hono/zod-openapi"
import { UNPROCESSABLE_ENTITY } from "stoker/http-status-codes"

import type { AppBindings } from "~/lib/type"

const defaultHook: Hook<unknown, AppBindings, string, unknown> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        ret: -1,
        msg: "Validation Error",
        data: {
          success: false,
          error: {
            name: result.error.name,
            issues: result.error.issues,
          },
        },
      },
      UNPROCESSABLE_ENTITY,
    )
  }
}

export default defaultHook