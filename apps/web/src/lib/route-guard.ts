import { AppError } from "@/lib/errors"
import { usePermissions } from "@/stores/permissions"

/**
 * 在 TanStack Router 的 beforeLoad / loader 中调用，
 * 权限不足时抛出 AppError(status: 403)。
 *
 * 用法：
 * ```ts
 * import { requirePermission } from "@/lib/route-guard"
 *
 * export const Route = createFileRoute("/_authenticated/tasks/")({
 *   beforeLoad: () => {
 *     requirePermission("tasks:read")
 *   },
 *   component: TasksIndex,
 * })
 * ```
 *
 * 注意：必须在 React 组件上下文内调用（beforeLoad 运行在组件树中）。
 * 如果在纯 loader（非组件树）中需要权限检查，请使用 store.getState().has()。
 */
export function requirePermission(perm: string): void {
  const { isLoaded, has } = usePermissions.getState()

  /* 权限尚未加载 — 跳过一次（组件 mount 后会重新校验） */
  if (!isLoaded) return

  if (!has(perm)) {
    throw new AppError(403)
  }
}

/**
 * 在非组件上下文（如 loader 函数）中检查权限。
 *
 * @returns true 如果用户持有目标权限
 */
export function checkPermission(perm: string): boolean {
  const { isLoaded, has } = usePermissions.getState()
  if (!isLoaded) return true // 未加载时放行，组件层会抛 403
  return has(perm)
}