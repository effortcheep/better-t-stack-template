/**
 * 统一响应信封 + OpenAPI schema 辅助函数
 *
 * 所有业务响应统一格式: { ret: number, msg: string, data: T }
 * - ret = 0   → 成功
 * - ret = -1  → 错误
 */

import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"

/** 将指定 schema 包裹进统一信封 */
export const envelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    ret: z.number().openapi({ example: 0 }),
    msg: z.string().openapi({ example: "ok" }),
    data: data.nullable(),
  })

/**
 * 请求体 schema 描述 — 不带信封（和 stoker 原始行为一致）。
 *
 * 用法: request: { body: bodyContentRequired(insertTasksSchema, "创建参数") }
 */
export const bodyContent = <T extends z.ZodTypeAny>(
  schema: T,
  description: string,
) => ({
  content: { "application/json": { schema } },
  description,
})

/** 同 bodyContent，外加 required: true */
export const bodyContentRequired = <T extends z.ZodTypeAny>(
  schema: T,
  description: string,
) => ({
  ...bodyContent(schema, description),
  required: true,
})

/**
 * 响应 body schema 描述 — 带信封。
 *
 * 用法: responses: { [200]: jsonContent(taskSchema, "任务详情") }
 * 生成: { content: { "application/json": { schema: { ret, msg, data: taskSchema } } }, description }
 */
export const jsonContent = <T extends z.ZodTypeAny>(
  schema: T,
  description: string,
) => ({
  content: { "application/json": { schema: envelopeSchema(schema) } },
  description,
})

/** 同 jsonContent，外加 required: true */
export const jsonContentRequired = <T extends z.ZodTypeAny>(
  schema: T,
  description: string,
) => ({
  ...jsonContent(schema, description),
  required: true,
})

// ---------------------------------------------------------------------------
// 分页
// ---------------------------------------------------------------------------

/** 分页数据 schema（不带信封），作为 jsonContent 的入参 */
export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative().openapi({ example: 42 }),
    page: z.number().int().positive().openapi({ example: 1 }),
    pageSize: z.number().int().min(1).max(100).openapi({ example: 20 }),
  })

/** 分页 + 排序 query 参数 schema */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
})

// ---------------------------------------------------------------------------
// Handler 响应辅助函数
// ---------------------------------------------------------------------------

/** 成功响应 (200) */
export const ok = <T>(c: Context, data: T) =>
  c.json({ ret: 0, msg: "ok", data }, HttpStatusCodes.OK)

/** 创建成功响应 (201) */
export const created = <T>(c: Context, data: T) =>
  c.json({ ret: 0, msg: "ok", data }, HttpStatusCodes.CREATED)

/** 无内容响应 (204) */
export const noContent = (c: Context) =>
  c.body(null, HttpStatusCodes.NO_CONTENT)

/** 业务错误响应 */
export const err = <const S extends ContentfulStatusCode>(
  c: Context,
  msg: string,
  status: S,
) => c.json({ ret: -1, msg, data: null }, status)