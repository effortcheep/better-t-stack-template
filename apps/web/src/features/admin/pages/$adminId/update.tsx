import { Button } from "@better-t-stack-template/ui/components/button"
import { Card, CardContent } from "@better-t-stack-template/ui/components/card"
import { Input } from "@better-t-stack-template/ui/components/input"
import { Label } from "@better-t-stack-template/ui/components/label"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { KeyRoundIcon } from "lucide-react"

import { useChangePassword } from "@/features/admin/api"

export interface AdminUpdatePageProps {
  adminId: string
}

export default function AdminUpdatePage({
  adminId,
}: AdminUpdatePageProps) {
  const navigate = useNavigate()
  const changePassword = useChangePassword(adminId)

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await changePassword.mutateAsync(value)
      navigate({ to: "/admin/$adminId", params: { adminId } })
    },
  })

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">修改密码</h1>
          <p className="text-sm text-muted-foreground">为管理员设置新密码</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? "密码不能为空"
                    : value.length < 8
                      ? "密码至少8位"
                      : undefined,
              }}
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>新密码</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="输入新密码（至少8位）"
                  />
                  {field.state.meta.errors && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors}
                    </p>
                  )}
                </div>
              )}
            />

            <Button
              type="submit"
              disabled={changePassword.isPending}
            >
              <KeyRoundIcon data-icon="inline-start" />
              {changePassword.isPending ? "保存中…" : "修改密码"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}