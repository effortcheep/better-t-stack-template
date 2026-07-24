/**
 * 信封版全局错误中间件
 *
 * 从 stoker 的 onError 改编，响应格式从 { message, stack } 改为信封 { ret, msg, data }。
 */

import type { ErrorHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { INTERNAL_SERVER_ERROR, OK } from "stoker/http-status-codes"

const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err ? err.status : c.newResponse(null).status
  const statusCode: ContentfulStatusCode =
    currentStatus !== OK && typeof currentStatus === "number"
      ? currentStatus as ContentfulStatusCode
      : INTERNAL_SERVER_ERROR
  const isProduction = c.env?.NODE_ENV === "production" || process.env?.NODE_ENV === "production"

  return c.json(
    {
      ret: -1,
      msg: err.message,
      data: isProduction ? null : { stack: err.stack },
    },
    statusCode,
  )
}

export default onError