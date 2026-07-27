import { useNavigate } from "@tanstack/react-router"

import { RoleForm } from "@/features/admin/components/role/role-form"
import { useCreateRole } from "@/features/admin/role-api"

export default function AddRolePage() {
  const navigate = useNavigate()
  const createMutation = useCreateRole()

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            新建角色
          </h1>
          <p className="text-sm text-muted-foreground">
            填写以下信息创建新的角色
          </p>
        </div>
      </div>

      <RoleForm
        onSubmit={(values) =>
          createMutation.mutate(values, {
            onSuccess: () => navigate({ to: "/admin/roles" }),
          })
        }
        isPending={createMutation.isPending}
        submitLabel="创建角色"
      />
    </div>
  )
}