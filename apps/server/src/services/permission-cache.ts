import { db, eq, inArray } from "@better-t-stack-template/db"
import {
  rolePermissions,
  userRoles,
} from "@better-t-stack-template/db/schema/authz"
import { expandWildcard } from "~/lib/permissions"
import { redis } from "~/lib/redis"

/** Redis key 前缀 */
const PREFIX = "permissions"

/**
 * 构建用户权限缓存 key。
 * @returns `permissions:<userId>`
 */
function cacheKey(userId: string): string {
  return `${PREFIX}:${userId}`
}

/**
 * 从数据库查询用户的权限码并集（含通配展开）。
 *
 * 查询路径：
 *   user_roles → roles → role_permissions → 展开 *:*
 *
 * @returns 去重后的权限码数组
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

/**
 * 获取用户权限（缓存优先）。
 * 未命中时查库并回写缓存。
 */
export async function getUserPermissions(
  userId: string,
): Promise<string[]> {
  const key = cacheKey(userId)

  const cached = await redis.get(key)
  if (cached) {
    return cached.split(",").filter(Boolean)
  }

  const perms = await getUserPermissionsFromDb(userId)
  await cacheUserPermissions(userId, perms)
  return perms
}

/**
 * 将权限列表写入 Redis 缓存（逗号分隔字符串）。
 * 不设 TTL — 由主动失效驱动。
 */
export async function cacheUserPermissions(
  userId: string,
  permissions: string[],
): Promise<void> {
  const key = cacheKey(userId)
  await redis.set(key, permissions.join(","))
}

/**
 * 清除单个用户的权限缓存。
 */
export async function clearUserPermissions(
  userId: string,
): Promise<void> {
  const key = cacheKey(userId)
  await redis.del(key)
}

/**
 * 清除拥有指定角色的所有用户的权限缓存。
 */
export async function clearRolePermissions(
  roleId: string,
): Promise<void> {
  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.roleId, roleId))

  if (rows.length === 0) return

  const keys = rows.map((r) => cacheKey(r.userId))
  await redis.del(...keys)
}

/**
 * 清除拥有指定角色集合的用户的权限缓存。
 */
export async function clearRolePermissionsBulk(
  roleIds: string[],
): Promise<void> {
  if (roleIds.length === 0) return

  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(inArray(userRoles.roleId, roleIds))

  if (rows.length === 0) return

  const keys = [...new Set(rows.map((r) => cacheKey(r.userId)))]
  await redis.del(...keys)
}