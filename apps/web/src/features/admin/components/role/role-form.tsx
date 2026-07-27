import { useForm } from "@tanstack/react-form"

import { Button } from "@better-t-stack-template/ui/components/button"
import { Card, CardContent } from "@better-t-stack-template/ui/components/card"
import { Input } from "@better-t-stack-template/ui/components/input"
import { Label } from "@better-t-stack-template/ui/components/label"
import { Textarea } from "@better-t-stack-template/ui/components/textarea"

import type { RoleCreateInput, RoleRecord } from "@/features/admin/role-types"

interface RoleFormProps {
  defaultValues?: RoleRecord | null
  onSubmit: (data: RoleCreateInput) => void
  submitLabel?: string
  isPending?: boolean
}

export function RoleForm({
  defaultValues,
  onSubmit,
  submitLabel = "保存",
  isPending = false,
}: RoleFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit(value as RoleCreateInput)
    },
  })

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value ? "名称不能为空" : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>角色名称</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="输入角色名称"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>描述（可选）</Label>
              <Textarea
                id={field.name}
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="输入角色描述"
                rows={3}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              disabled={isPending || !canSubmit}
              onClick={form.handleSubmit}
            >
              {isPending ? "保存中…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </CardContent>
    </Card>
  )
}