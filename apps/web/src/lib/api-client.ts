import { getToken } from "@/lib/auth"

export type ApiEnvelope<T> = {
  ret: number
  msg: string
  data: T | null
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly requestId?: string | null,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean
}

/**
 * 统一 fetch 封装 — 解析信封、携带 Request ID (#38, #68)
 */
export async function apiFetch<T>(
  input: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)

  if (!skipAuth) {
    const token = getToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(input, { ...rest, headers })
  const requestId = res.headers.get("x-request-id")

  if (res.status === 204) return undefined as T

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!json || typeof json.ret !== "number") {
    throw new ApiError(
      `无效响应 (${res.status})`,
      res.status,
      requestId,
    )
  }

  if (json.ret !== 0) {
    throw new ApiError(json.msg || "请求失败", res.status, requestId)
  }

  return json.data as T
}

/** 从 ApiError 提取用户可见消息，附带 Request ID (#68) */
export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.requestId
      ? `${err.message} (ID: ${err.requestId})`
      : err.message
  }
  if (err instanceof Error) return err.message
  return "未知错误"
}
