import { db, eq, inArray } from "@better-t-stack-template/db"
import {
  rolePermissions,
  userRoles,
} from "@better-t-stack-template/db/schema/authz"
import { CACHE_KEYS } from "~/lib/cache-keys"
import { expandWildcard } from "~/lib/permissions"
import { redis } from "~/lib/redis"

/** 进行中的权限加载 — 防缓存击穿 (#44) */
const inflight = new Map<string, Promise<string[]>>()

function parseCached(raw: string): string[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
      return parsed
    }
  } catch {
    // 兼容旧版逗号分隔格式
    if (raw.includes(",")) return raw.split(",").filter(Boolean)
    if (raw.length > 0) return [raw]
  }
  return null
}

/**
 * 从数据库查询用户的权限码并集（含通配展开）。
 */
export async function getUserPermissionsFromDb(
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .where(eq(userRoles.userId, userId))

  const expanded = new Set<string>()
  for (const r of rows) {
    for (const p of expandWildcard(r.permission)) {
      expanded.add(p)
    }
  }
  return [...expanded]
}

async function readFromRedis(userId: string): Promise<string[] | null> {
  try {
    const key = CACHE_KEYS.userPermissions(userId)
    const cached = await redis.get(key)
    if (!cached) return null
    return parseCached(cached)
  } catch {
    return null
  }
}

async function writeToRedis(
  userId: string,
  permissions: string[],
): Promise<void> {
  try {
    const key = CACHE_KEYS.userPermissions(userId)
    await redis.set(key, JSON.stringify(permissions))
  } catch {
    // Redis 不可用时静默降级 — 回源 DB (#39)
  }
}

/**
 * 获取用户权限（缓存优先，Redis 不可用时回源 DB）。
 */
export async function getUserPermissions(
  userId: string,
): Promise<string[]> {
  const pending = inflight.get(userId)
  if (pending) return pending

  const load = (async () => {
    const cached = await readFromRedis(userId)
    if (cached) return cached

    const perms = await getUserPermissionsFromDb(userId)
    await cacheUserPermissions(userId, perms)
    return perms
  })()

  inflight.set(userId, load)
  try {
    return await load
  } finally {
    inflight.delete(userId)
  }
}

export async function cacheUserPermissions(
  userId: string,
  permissions: string[],
): Promise<void> {
  await writeToRedis(userId, permissions)
}

export async function clearUserPermissions(
  userId: string,
): Promise<void> {
  try {
    await redis.del(CACHE_KEYS.userPermissions(userId))
  } catch {
    // 降级：忽略 Redis 删除失败
  }
}

export async function clearRolePermissions(
  roleId: string,
): Promise<void> {
  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.roleId, roleId))

  if (rows.length === 0) return

  const keys = rows.map((r) => CACHE_KEYS.userPermissions(r.userId))
  try {
    await redis.del(...keys)
  } catch {
    // 降级
  }
}

export async function clearRolePermissionsBulk(
  roleIds: string[],
): Promise<void> {
  if (roleIds.length === 0) return

  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(inArray(userRoles.roleId, roleIds))

  if (rows.length === 0) return

  const keys = [...new Set(rows.map((r) => CACHE_KEYS.userPermissions(r.userId)))]
  try {
    await redis.del(...keys)
  } catch {
    // 降级
  }
}
