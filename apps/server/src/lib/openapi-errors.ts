import { z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { jsonContent } from "~/lib/response-helpers"

/** 标准业务错误响应 OpenAPI schema (#67) */
export const errorEnvelopeSchema = z.object({
  ret: z.literal(-1),
  msg: z.string(),
  data: z.null(),
})

export function errorResponse(description: string) {
  return jsonContent(z.null(), description)
}

/** 常用 HTTP 错误响应集合，供 routes 展开 */
export const standardErrors = {
  unauthorized: {
    [HttpStatusCodes.UNAUTHORIZED]: errorResponse("未登录"),
  },
  forbidden: {
    [HttpStatusCodes.FORBIDDEN]: errorResponse("权限不足"),
  },
  notFound: {
    [HttpStatusCodes.NOT_FOUND]: errorResponse("资源不存在"),
  },
  conflict: {
    [HttpStatusCodes.CONFLICT]: errorResponse("冲突"),
  },
  unprocessable: {
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: errorResponse("校验失败"),
  },
} as const
