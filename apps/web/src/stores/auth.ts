import { useState } from "react"
import { clearToken, decodeAccessToken, getToken } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<Record<string, unknown> | null>(() => {
    const token = getToken()
    if (!token) return null
    const payload = decodeAccessToken(token)
    if (!payload) {
      clearToken()
      return null
    }
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      clearToken()
      return null
    }
    return payload
  })

  const isAuthenticated = !!user

  return {
    user,
    session: null,
    isLoading: false,
    isAuthenticated,
    refetch: () => {},
  }
}