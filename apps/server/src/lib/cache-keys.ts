/** Redis / 缓存 key 工厂 — 避免魔法字符串 (#63) */
export const CACHE_KEYS = {
  userPermissions: (userId: string) => `permissions:${userId}`,
} as const
