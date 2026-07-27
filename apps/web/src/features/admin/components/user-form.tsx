"use client"

import { useForm } from "@tanstack/react-form"

import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@better-t-stack-template/ui/components/field"
import { Input } from "@better-t-stack-template/ui/components/input"

import type { CreateUserBody } from "@/features/admin/types"

interface UserFormProps {
  onSubmit: (data: CreateUserBody) => void
  isPending?: boolean
  submitLabel?: string
  onCancel?: () => void
}

export function UserForm({
  onSubmit: onSubmitProp,
  isPending = false,
  submitLabel = "创建管理员",
  onCancel,
}: UserFormProps) {
  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      username: "",
      password: "",
    },
    onSubmit: ({ value }) => {
      onSubmitProp(value as CreateUserBody)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <div className="grid gap-4 @md/field-group:grid-cols-2">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "邮箱不能为空"
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    ? "请输入有效的邮箱地址"
                    : undefined,
            }}
          >
            {(field) => (
              <Field
                orientation="vertical"
                data-invalid={!!field.state.meta.errors.length}
              >
                <FieldLabel htmlFor={field.name}>
                  邮箱
                  <span className="ml-0.5 text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    placeholder="admin@example.com"
                    aria-invalid={!!field.state.meta.errors.length}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(field.state.meta.errors as (string | undefined)[]).map(
                        (er) => ({
                          message: typeof er === "string" ? er : "格式不正确",
                        }),
                      )}
                    />
                  ) : null}
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value ? "名称不能为空" : undefined,
            }}
          >
            {(field) => (
              <Field
                orientation="vertical"
                data-invalid={!!field.state.meta.errors.length}
              >
                <FieldLabel htmlFor={field.name}>
                  名称
                  <span className="ml-0.5 text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder="输入用户名称…"
                    aria-invalid={!!field.state.meta.errors.length}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(field.state.meta.errors as (string | undefined)[]).map(
                        (er) => ({
                          message: typeof er === "string" ? er : "格式不正确",
                        }),
                      )}
                    />
                  ) : null}
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value ? "用户名不能为空" : undefined,
            }}
          >
            {(field) => (
              <Field
                orientation="vertical"
                data-invalid={!!field.state.meta.errors.length}
              >
                <FieldLabel htmlFor={field.name}>
                  用户名
                  <span className="ml-0.5 text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder="输入用户名…"
                    aria-invalid={!!field.state.meta.errors.length}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(field.state.meta.errors as (string | undefined)[]).map(
                        (er) => ({
                          message: typeof er === "string" ? er : "格式不正确",
                        }),
                      )}
                    />
                  ) : null}
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "密码不能为空"
                  : value.length < 8
                    ? "密码至少 8 位"
                    : undefined,
            }}
          >
            {(field) => (
              <Field
                orientation="vertical"
                data-invalid={!!field.state.meta.errors.length}
              >
                <FieldLabel htmlFor={field.name}>
                  密码
                  <span className="ml-0.5 text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    placeholder="输入密码（至少 8 位）…"
                    aria-invalid={!!field.state.meta.errors.length}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(field.state.meta.errors as (string | undefined)[]).map(
                        (er) => ({
                          message: typeof er === "string" ? er : "格式不正确",
                        }),
                      )}
                    />
                  ) : (
                    <FieldError
                      errors={[{ message: "至少 8 位字符" }]}
                    />
                  )}
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </div>
      </FieldGroup>

      <div className="flex items-center gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            返回
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
