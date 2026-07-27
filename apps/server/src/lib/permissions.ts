/**
 * 权限码常量 — 核心权限的命名空间引用。
 * 运行时不做白名单校验，任意 `resource:action` 都接受。
 * expandWildcard 展开时仅包含通配自身（不再列出具体权限），由前端的 has() 方法通过 WILDCARD 匹配来覆盖。
 */

/** 通配 — 匹配所有权限。 */
export const WILDCARD = "*:*" as const

/** 将通配展开（通配仅与自身匹配，前端 has() 通过检查 WILDCARD 来判定覆盖）。 */
export function expandWildcard(perm: string): string[] {
  return [perm]
}

/** 检查 target 是否被 permissions 覆盖（含通配）。 */
export function hasPermission(
  permissions: ReadonlySet<string>,
  target: string,
): boolean {
  return permissions.has(WILDCARD) || permissions.has(target)
}