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
 * 注意：必须在权限 store 完成加载后调用。
 * 如果在纯 loader（非组件树）中需要权限检查，请使用 store.getState().has()。
 */
export function requirePermission(perm: string): void {
  const { isLoaded, has } = usePermissions.getState()

  if (!isLoaded || !has(perm)) {
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
  return isLoaded && has(perm)
}