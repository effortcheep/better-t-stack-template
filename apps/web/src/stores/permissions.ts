import { create } from "zustand"

import { env } from "@better-t-stack-template/env/web"
import { getToken } from "@/lib/auth"

/** 权限码常量 — 与后端 apps/server/src/lib/permissions.ts 保持同步 */
export const WILDCARD = "*:*" as const

interface PermissionsState {
  /** 当前用户的权限码集合 */
  permissions: Set<string>
  /** 是否已从服务端加载 */
  isLoaded: boolean
  /** 从服务端获取权限 */
  fetch: () => Promise<void>
  /** 检查是否持有目标权限（含通配 *:* 展开） */
  has: (perm: string) => boolean
  /** 清空（登出时调用） */
  clear: () => void
}

export const usePermissions = create<PermissionsState>(
  (set, get) => ({
    permissions: new Set(),
    isLoaded: false,

    fetch: async () => {
      const token = getToken()
      if (!token) {
        set({ permissions: new Set(), isLoaded: true })
        return
      }

      try {
        const res = await fetch(`${env.VITE_SERVER_URL}/api/v1/me/permissions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          set({ permissions: new Set(), isLoaded: true })
          return
        }
        const body = (await res.json()) as {
          ret: number
          msg: string
          data: string[]
        }
        const perms = body.data ?? []
        set({
          permissions: new Set(perms),
          isLoaded: true,
        })
      } catch {
        set({ permissions: new Set(), isLoaded: true })
      }
    },

    has: (perm: string) => {
      const { permissions } = get()
      return (
        permissions.has(WILDCARD) || permissions.has(perm)
      )
    },

    clear: () => {
      set({ permissions: new Set(), isLoaded: false })
    },
  }),
)