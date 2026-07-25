import { z } from "zod"

/** 任务实体完整类型 */
export type TaskRecord = {
  id: number
  name: string
  done: boolean
  createdAt: Date
  updatedAt: Date
}

/** 任务列表查询参数 */
export type TaskListParams = {
  search?: string
  page?: number
  pageSize?: number
  sort?: "createdAt" | "updatedAt"
  order?: "asc" | "desc"
}

/** 任务列表查询响应 */
export type TaskListResponse = {
  items: TaskRecord[]
  total: number
  page: number
  pageSize: number
}

// ====== Zod 校验 schema（与 server 端一致） ======

/** 服务端返回的 task 对象校验 */
export const selectTaskSchema = z.object({
  id: z.number(),
  name: z.string(),
  done: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

/** 创建 task 请求体校验 */
export const insertTaskSchema = z.object({
  name: z.string().min(1).max(500),
  done: z.boolean(),
})

/** 更新 task 请求体校验（全部字段可选） */
export const patchTaskSchema = insertTaskSchema.partial()

/** 分页列表响应校验 */
export const taskListResponseSchema = z.object({
  items: z.array(selectTaskSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})