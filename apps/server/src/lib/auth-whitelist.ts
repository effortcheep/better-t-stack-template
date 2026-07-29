/** 无需 JWT 认证即可访问的 API 路径 (#34) */
export const AUTH_WHITELIST = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/check-username",
  "/api/v1/auth/token",
  "/api/v1/auth/jwks",
] as const

export function isAuthWhitelisted(path: string): boolean {
  return (AUTH_WHITELIST as readonly string[]).includes(path)
}
