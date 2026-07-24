/**
 * 信封版 404 中间件
 *
 * 从 stoker 的 notFound 改编，响应格式从 { message } 改为信封 { ret, msg, data }。
 */

import type { NotFoundHandler } from "hono"
import { NOT_FOUND } from "stoker/http-status-codes"

const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      ret: -1,
      msg: `Not Found - ${c.req.path}`,
      data: null,
    },
    NOT_FOUND,
  )
}

export default notFound