import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@better-t-stack-template/ui/components/empty"
import { Skeleton } from "@better-t-stack-template/ui/components/skeleton"
import { Link, useNavigate } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"

import { RoleForm } from "@/features/admin/components/role/role-form"
import { RolePermissionsCard } from "@/features/admin/components/role/role-permissions-card"
import { useRole, useUpdateRole } from "@/features/admin/role-api"

export interface UpdateRolePageProps {
  roleId: string
}

export default function UpdateRolePage({
  roleId,
}: UpdateRolePageProps) {
  const navigate = useNavigate()
  const { data, isLoading } = useRole(roleId)
  const updateMutation = useUpdateRole(roleId)

  if (isLoading) {
    return (
      <div className="flex w-full flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-18 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 pt-0">
        <Empty>
          <EmptyMedia variant="icon">
            <SearchIcon className="size-8 text-muted-foreground/60" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>角色不存在</EmptyTitle>
            <EmptyDescription>
              该角色可能已被删除
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              render={
                <Link to="/admin/roles" />
              }
            >
              返回列表
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            编辑角色
          </h1>
          <p className="text-sm text-muted-foreground">
            正在编辑「{data.name}」
          </p>
        </div>
      </div>

      <RoleForm
        defaultValues={data}
        onSubmit={(values) =>
          updateMutation.mutate(values, {
            onSuccess: () =>
              navigate({ to: "/admin/roles" }),
          })
        }
        isPending={updateMutation.isPending}
        submitLabel="保存修改"
      />

      <RolePermissionsCard roleId={roleId} />
    </div>
  )
}