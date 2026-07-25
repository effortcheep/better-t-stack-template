import { env } from "@better-t-stack-template/env/web"

const SERVER_URL = env.VITE_SERVER_URL
const TOKEN_KEY = "bearer_token"

export function getToken(): string | null {
  if (typeof localStorage === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/** 本地解码 JWT payload（不做验签，仅提取信息） */
export function decodeAccessToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function login(body: {
  username?: string
  email?: string
  password: string
}) {
  const res = await fetch(`${SERVER_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok || json.ret !== 0) {
    throw new Error(json.msg ?? "登录失败")
  }

  if (json.data?.accessToken) {
    setToken(json.data.accessToken)
  }

  return json.data
}

export async function logout() {
  const token = getToken()

  await fetch(`${SERVER_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  })

  clearToken()
}