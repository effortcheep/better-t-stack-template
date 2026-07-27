import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"

import {
  selectRoleSchema,
  selectRolePermissionSchema,
} from "@better-t-stack-template/db/schema/authz"

import {
  bodyContent,
  bodyContentRequired,
  jsonContent,
  jsonContentRequired,
  paginatedSchema,
  paginationQuerySchema,
} from "~/lib/response-helpers"

/* ---- Zod 校验 schema ---- */

export const insertRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const patchRoleSchema = insertRoleSchema.partial()

export const insertPermissionSchema = z.object({
  permission: z.string().regex(/^.+:.+$/, "格式要求 resource:action"),
})


/* -- 路径参数 -- */

const roleIdParam = z.object({ id: z.string().min(1) })
const rolePermParam = z.object({ roleId: z.string().min(1) })
const rolePermDeleteParam = z.object({
  roleId: z.string().min(1),
  permission: z.string().regex(/^.+:.+$/, "格式要求 resource:action"),
})

/* ---- 角色 ---- */

const roleTags = ["Roles"]

export const listRoles = createRoute({
  path: "/roles",
  method: "get",
  request: {
    query: paginationQuerySchema,
  },
  tags: roleTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      paginatedSchema(selectRoleSchema),
      "角色列表（分页）",
    ),
  },
})

export const createRole = createRoute({
  path: "/roles",
  method: "post",
  request: {
    body: bodyContentRequired(insertRoleSchema, "创建角色参数"),
  },
  tags: roleTags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContentRequired(
      selectRoleSchema,
      "已创建的角色",
    ),
  },
})

export const getRole = createRoute({
  path: "/roles/{id}",
  method: "get",
  request: {
    params: roleIdParam,
  },
  tags: roleTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectRoleSchema,
      "角色详情",
    ),
  },
})

export const updateRole = createRoute({
  path: "/roles/{id}",
  method: "patch",
  request: {
    params: roleIdParam,
    body: bodyContent(patchRoleSchema, "更新角色参数"),
  },
  tags: roleTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectRoleSchema,
      "已更新的角色",
    ),
  },
})

export const deleteRole = createRoute({
  path: "/roles/{id}",
  method: "delete",
  request: {
    params: roleIdParam,
  },
  tags: roleTags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "已删除",
    },
  },
})

/* ---- 角色权限 ---- */

const permTags = ["Role Permissions"]

export const listRolePermissions = createRoute({
  path: "/roles/{roleId}/permissions",
  method: "get",
  request: {
    params: rolePermParam,
  },
  tags: permTags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectRolePermissionSchema),
      "角色权限列表",
    ),
  },
})

export const addRolePermission = createRoute({
  path: "/roles/{roleId}/permissions",
  method: "post",
  request: {
    params: rolePermParam,
    body: bodyContentRequired(
      insertPermissionSchema,
      "添加权限参数",
    ),
  },
  tags: permTags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContentRequired(
      selectRolePermissionSchema,
      "已添加的权限",
    ),
  },
})

export const removeRolePermission = createRoute({
  path: "/roles/{roleId}/permissions/{permission}",
  method: "delete",
  request: {
    params: rolePermDeleteParam,
  },
  tags: permTags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "已移除",
    },
  },
})


/* ---- 权限码列表 ---- */

export const listAllPermissions = createRoute({
  path: "/permissions",
  method: "get",
  tags: ["Permissions"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(
        z.object({
          module: z.string(),
          permissions: z.array(
            z.object({
              code: z.string(),
              description: z.string(),
            }),
          ),
        }),
      ),
      "权限码列表（按模块分组）",
    ),
  },
})

/* ---- 类型导出 ---- */

export type ListRolesRoute = typeof listRoles
export type CreateRoleRoute = typeof createRole
export type GetRoleRoute = typeof getRole
export type UpdateRoleRoute = typeof updateRole
export type DeleteRoleRoute = typeof deleteRole
export type ListRolePermissionsRoute = typeof listRolePermissions
export type AddRolePermissionRoute = typeof addRolePermission
export type RemoveRolePermissionRoute = typeof removeRolePermission
export type ListAllPermissionsRoute = typeof listAllPermissions