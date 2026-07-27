import { selectRoleSchema } from "@better-t-stack-template/db/schema/authz"
import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"

import {
  bodyContentRequired,
  jsonContent,
  jsonContentRequired,
  paginatedSchema,
  paginationQuerySchema,
} from "~/lib/response-helpers"

/* ---- Zod 校验 schema ---- */

/** 创建用户请求体 */
export const createUserSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(8).openapi({ description: "最少 8 位" }),
  name: z.string().min(1).openapi({ example: "张三" }),
  username: z.string().min(1).openapi({ example: "zhangsan" }),
})

/** 修改密码请求体 */
export const changePasswordSchema = z.object({
  password: z.string().min(8).openapi({ description: "新密码，最少 8 位" }),
})

/** 角色分配请求体 */
export const assignRoleSchema = z.object({
  roleId: z.string().min(1),
})

/* -- 路径参数 -- */

const userIdParam = z.object({ id: z.string().min(1) })
const userRoleDeleteParam = z.object({
  userId: z.string().min(1),
  roleId: z.string().min(1),
})

/* -- 用户列表 query 参数 -- 扩展分页 + 搜索 -- */

const userListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional().openapi({ description: "搜索邮箱或用户名" }),
})

/* -- 响应用户信息 schema -- */

/** 列表项中的简版角色 */
const userRoleBriefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

/** 用户列表项 */
export const userListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  roles: z.array(userRoleBriefSchema),
})

/** 用户详情（含完整角色信息） */
export const userDetailSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  username: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable(),
      createdAt: z.string(),
    }),
  ),
})

/* ---- 路由定义 ---- */

const tags = ["Admin - Users"]

/** GET /admin/users — 分页用户列表 */
export const listUsers = createRoute({
  path: "/users",
  method: "get",
  request: { query: userListQuerySchema },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContentRequired(
      paginatedSchema(userListItemSchema),
      "分页用户列表",
    ),
  },
})
export type ListUsersRoute = typeof listUsers

/** POST /admin/users — 创建用户 */
export const createUser = createRoute({
  path: "/users",
  method: "post",
  request: { body: bodyContentRequired(createUserSchema, "创建用户参数") },
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(z.unknown(), "已创建的用户"),
    [HttpStatusCodes.OK]: jsonContent(z.unknown(), "业务错误"),
  },
})
export type CreateUserRoute = typeof createUser
/** GET /admin/users/{id} — 用户详情 */
export const getUser = createRoute({
  path: "/users/{id}",
  method: "get",
  request: { params: userIdParam },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.unknown(), "用户详情"),
  },
})
export type GetUserRoute = typeof getUser

/** POST /admin/users/{id}/change-password — 修改密码 */
export const changePassword = createRoute({
  path: "/users/{id}/change-password",
  method: "post",
  request: {
    params: userIdParam,
    body: bodyContentRequired(changePasswordSchema, "新密码"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.unknown(), "修改结果"),
  },
})
export type ChangePasswordRoute = typeof changePassword

/** GET /admin/users/{userId}/roles — 列出用户角色 */
export const listUserRoles = createRoute({
  path: "/users/{userId}/roles",
  method: "get",
  request: {
    params: z.object({ userId: z.string().min(1) }),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectRoleSchema),
      "用户角色列表",
    ),
  },
})
export type ListUserRolesRoute = typeof listUserRoles

/** POST /admin/users/{userId}/roles — 分配角色 */
export const assignUserRole = createRoute({
  path: "/users/{userId}/roles",
  method: "post",
  request: {
    params: z.object({ userId: z.string().min(1) }),
    body: bodyContentRequired(assignRoleSchema, "角色 ID"),
  },
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContentRequired(
      selectRoleSchema,
      "已分配的角色",
    ),
  },
})
export type AssignUserRoleRoute = typeof assignUserRole

/** DELETE /admin/users/{userId}/roles/{roleId} — 撤销角色 */
export const unassignUserRole = createRoute({
  path: "/users/{userId}/roles/{roleId}",
  method: "delete",
  request: { params: userRoleDeleteParam },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "已移除" },
  },
})
export type UnassignUserRoleRoute = typeof unassignUserRole