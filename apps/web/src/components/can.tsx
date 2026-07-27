import { usePermissions } from "@/stores/permissions"

interface CanProps {
  /** 所需权限码 — OR 逻辑：用户满足任意一个即渲染 children */
  permission: string | string[]
  children: React.ReactNode
}

/**
 * 声明式权限守卫组件。
 *
 * 用法示例：
 * ```tsx
 * <Can permission="tasks:create">
 *   <Button>新建任务</Button>
 * </Can>
 *
 * <Can permission={["tasks:delete", "users:assign"]}>
 *   <Button>删除</Button>
 * </Can>
 * ```
 */
export function Can({ permission, children }: CanProps) {
  const { has } = usePermissions()

  const perms = Array.isArray(permission) ? permission : [permission]
  if (!perms.some((p) => has(p))) return null

  return <>{children}</>
}