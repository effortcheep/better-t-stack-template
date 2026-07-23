import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { useState } from "react"

import { TemplateForm } from "@/components/template-form"
import { useCreateTemplate } from "@/lib/api"

export const Route = createFileRoute(
  "/_authenticated/template/add-template",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const createMutation = useCreateTemplate()
  const [isDirty, setIsDirty] = useState(false)

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            新建模板
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDirty
              ? "有未保存的修改"
              : "填写以下信息创建新的模板条目"}
          </p>
        </div>
      </div>

      <TemplateForm
        onSubmit={(values) =>
          createMutation.mutate(values, {
            onSuccess: () => navigate({ to: "/template" }),
          })
        }
        isPending={createMutation.isPending}
        onDirtyChange={setIsDirty}
        onCancel={() => navigate({ to: "/template" })}
      />
    </div>
  )
}
