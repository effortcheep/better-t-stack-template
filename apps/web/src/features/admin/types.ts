import { z } from "zod"

// -- 角色 --
export const userRoleBriefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})
export type UserRoleBrief = z.infer<typeof userRoleBriefSchema>

export const roleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  createdAt: z.string(),
})
export type Role = z.infer<typeof roleSchema>

// -- 用户列表项 --
export const userListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  roles: z.array(userRoleBriefSchema),
})
export type UserListItem = z.infer<typeof userListItemSchema>

// -- 用户详情 --
export const userDetailSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(roleSchema),
})
export type UserDetail = z.infer<typeof userDetailSchema>

// -- 分页响应 --
export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })

export const userListResponseSchema = paginatedSchema(userListItemSchema)
export type UserListResponse = z.infer<typeof userListResponseSchema>

// -- 请求体 --
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  username: z.string().min(1),
})
export type CreateUserBody = z.infer<typeof createUserSchema>

export const changePasswordSchema = z.object({
  password: z.string().min(8),
})
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>

export const assignRoleSchema = z.object({
  roleId: z.string().min(1),
})
export type AssignRoleBody = z.infer<typeof assignRoleSchema>

// -- 查询参数 --
/** API 调用用查询参数（字段均可选） */
export type UserListQueryInput = {
  search?: string
  page?: number
  pageSize?: number
  sort?: "createdAt" | "updatedAt"
  order?: "asc" | "desc"
}

/** Route validateSearch 用 Zod schema */
export const userListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
})
export type UserListQuery = z.infer<typeof userListQuerySchema>

// -- 响应信封 --
export const envelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    ret: z.number(),
    msg: z.string(),
    data: data,
  })

export const successEnvelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    ret: z.literal(0),
    msg: z.string(),
    data,
  })