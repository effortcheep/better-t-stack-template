import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { bodyContentRequired, jsonContent } from "~/lib/response-helpers"

const tags = ["Auth"]

// ---------------------------------------------------------------------------
// 登录
// ---------------------------------------------------------------------------

const loginSchema = z
  .object({
    username: z.string().optional().openapi({ description: "用户名" }),
    email: z.string().email().optional().openapi({ description: "邮箱" }),
    password: z.string().min(1).openapi({ description: "密码" }),
  })
  .refine((data) => data.username || data.email, {
    message: "需要提供 username 或 email",
  })

export const login = createRoute({
  path: "/api/v1/auth/login",
  method: "post",
  request: {
    body: bodyContentRequired(loginSchema, "登录参数"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.unknown(), "登录成功"),
  },
})

// ---------------------------------------------------------------------------
// 注册
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8).max(128),
  username: z
    .string()
    .min(3)
    .max(30)
    .optional()
    .openapi({ description: "登录账号名（可选）" }),
  displayUsername: z
    .string()
    .optional()
    .openapi({ description: "显示名称（可选）" }),
})

export const register = createRoute({
  path: "/api/v1/auth/register",
  method: "post",
  request: {
    body: bodyContentRequired(registerSchema, "注册参数"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.unknown(), "注册成功"),
  },
})

// ---------------------------------------------------------------------------
// 退出登录
// ---------------------------------------------------------------------------

export const logout = createRoute({
  path: "/api/v1/auth/logout",
  method: "post",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.null(), "退出成功"),
  },
})

// ---------------------------------------------------------------------------
// 检查用户名
// ---------------------------------------------------------------------------

const checkUsernameSchema = z.object({
  username: z.string().min(1).openapi({ description: "要检查的用户名" }),
})

const checkUsernameDataSchema = z.object({
  available: z.boolean(),
})

export const checkUsername = createRoute({
  path: "/api/v1/auth/check-username",
  method: "post",
  request: {
    body: bodyContentRequired(checkUsernameSchema, "用户名"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(checkUsernameDataSchema, "用户名是否可用"),
  },
})

export type LoginRoute = typeof login
export type RegisterRoute = typeof register
export type LogoutRoute = typeof logout
export type CheckUsernameRoute = typeof checkUsername