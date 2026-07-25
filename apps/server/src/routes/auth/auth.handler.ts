import { auth } from "@better-t-stack-template/auth"
import { APIError } from "better-auth"
import * as HttpStatusCodes from "stoker/http-status-codes"

import { ok } from "~/lib/response-helpers"
import type { AppRouteHandler } from "~/lib/type"

import type {
  CheckUsernameRoute,
  LoginRoute,
  LogoutRoute,
  RegisterRoute,
} from "./auth.routes"

/** 从 signIn/signUp 响应中提取 cookie，再用 cookie 换 JWT */
async function getAccessToken(
  signInRes: Response,
): Promise<string> {
  const setCookie = signInRes.headers.get("set-cookie")
  if (!setCookie) return ""

  const sessionRes = await auth.api.getSession({
    headers: new Headers({ cookie: setCookie }),
    asResponse: true,
  })

  return sessionRes?.headers.get("set-auth-jwt") ?? ""
}

export const login: AppRouteHandler<LoginRoute> = async (
  c,
) => {
  const body = c.req.valid("json")

  try {
    if (body.username) {
      const signInRes = await auth.api.signInUsername({
        body: {
          username: body.username,
          password: body.password,
        },
        asResponse: true,
      })

      if (!signInRes.ok) {
        const errData = (await signInRes
          .clone()
          .json()
          .catch(() => ({ message: "" }))) as {
          message?: string
        }
        return c.json(
          {
            ret: -1,
            msg: errData.message || "用户名或密码错误",
            data: null,
          },
          HttpStatusCodes.OK,
        )
      }

      const accessToken = await getAccessToken(signInRes)
      const setCookie = signInRes.headers.get("set-cookie")
      if (setCookie) c.header("set-cookie", setCookie)

      return ok(c, { accessToken })
    }

    const signInRes = await auth.api.signInEmail({
      body: { email: body.email!, password: body.password },
      asResponse: true,
    })

    if (!signInRes.ok) {
      const errData = (await signInRes
        .clone()
        .json()
        .catch(() => ({ message: "" }))) as {
        message?: string
      }
      return c.json(
        {
          ret: -1,
          msg: errData.message || "邮箱或密码错误",
          data: null,
        },
        HttpStatusCodes.OK,
      )
    }

    const accessToken = await getAccessToken(signInRes)
    const setCookie = signInRes.headers.get("set-cookie")
    if (setCookie) c.header("set-cookie", setCookie)

    return ok(c, { accessToken })
  } catch (err_) {
    if (err_ instanceof APIError) {
      return c.json(
        { ret: -1, msg: err_.message, data: null },
        HttpStatusCodes.OK,
      )
    }
    console.error(err_)
    return c.json(
      { ret: -1, msg: "服务器内部错误", data: null },
      HttpStatusCodes.OK,
    )
  }
}

export const register: AppRouteHandler<
  RegisterRoute
> = async (c) => {
  const body = c.req.valid("json")

  try {
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: body.email,
        name: body.name,
        password: body.password,
        username: body.username,
        displayUsername: body.displayUsername,
      },
      asResponse: true,
    })

    if (!signUpRes.ok) {
      const errData = (await signUpRes
        .clone()
        .json()
        .catch(() => ({ message: "" }))) as {
        message?: string
      }
      return c.json(
        {
          ret: -1,
          msg:
            errData.message ||
            "注册失败，邮箱或用户名可能已被使用",
          data: null,
        },
        HttpStatusCodes.OK,
      )
    }

    const accessToken = await getAccessToken(signUpRes)
    const setCookie = signUpRes.headers.get("set-cookie")
    if (setCookie) c.header("set-cookie", setCookie)

    return ok(c, { accessToken })
  } catch (err_) {
    if (err_ instanceof APIError) {
      return c.json(
        { ret: -1, msg: err_.message, data: null },
        HttpStatusCodes.OK,
      )
    }
    console.error(err_)
    return c.json(
      { ret: -1, msg: "服务器内部错误", data: null },
      HttpStatusCodes.OK,
    )
  }
}

export const logout: AppRouteHandler<LogoutRoute> = async (
  c,
) => {
  await auth.api.signOut({
    headers: c.req.raw.headers,
  })
  return ok(c, null)
}

export const checkUsername: AppRouteHandler<
  CheckUsernameRoute
> = async (c) => {
  const { username } = c.req.valid("json")
  const result = await auth.api.isUsernameAvailable({
    body: { username },
  })
  return ok(c, result ?? { available: false })
}
