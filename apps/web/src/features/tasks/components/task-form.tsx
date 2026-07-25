"use client"

import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@better-t-stack-template/ui/components/field"
import { Input } from "@better-t-stack-template/ui/components/input"
import { Switch } from "@better-t-stack-template/ui/components/switch"
import { useForm } from "@tanstack/react-form"
import { useEffect } from "react"

import type { TaskRecord } from "@/features/tasks/types"

interface TaskFormProps {
  defaultValues?: TaskRecord
  onSubmit: (values: { name: string; done: boolean }) => void | Promise<void>
  isPending?: boolean
  onDirtyChange?: (dirty: boolean) => void
  onCancel?: () => void
}

export function TaskForm({
  defaultValues,
  onSubmit: onSubmitProp,
  isPending,
  onDirtyChange,
  onCancel,
}: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      done: defaultValues?.done ?? false,
    },
    onSubmit: ({ value }) => {
      onSubmitProp(value)
    },
  })

  // 未保存变更时阻止意外关闭/刷新
  useEffect(() => {
    if (!form.state.isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [form.state.isDirty])

  // 表单变更状态通知父组件
  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty])

  const handleReset = () => {
    form.reset()
  }

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
        <div className="grid gap-4">
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "名称不能为空"
                  : value.length > 500
                    ? "名称不能超过 500 个字符"
                    : undefined,
            }}
            children={(field) => (
              <Field
                orientation="vertical"
                data-invalid={!!field.state.meta.errors.length}
              >
                <FieldLabel htmlFor="name">
                  名称
                  <span className="ml-0.5 text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    name="name"
                    value={field.state.value}
                    placeholder="输入任务名称…"
                    aria-invalid={!!field.state.meta.errors.length}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(field.state.meta.errors as Array<string | undefined>).map(
                        (er) => ({
                          message: typeof er === "string" ? er : "格式不正确",
                        }),
                      )}
                    />
                  ) : (
                    <FieldDescription>1-500 个字符</FieldDescription>
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <form.Field
            name="done"
            children={(field) => (
              <Field orientation="vertical">
                <FieldLabel htmlFor="done">完成状态</FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      id="done"
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                    <FieldLabel htmlFor="done" className="text-sm">
                      {field.state.value ? "已完成" : "未完成"}
                    </FieldLabel>
                  </div>
                </FieldContent>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex items-center gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            返回
          </Button>
        )}
        <Button type="button" variant="outline" onClick={handleReset}>
          重置
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "保存中…"
            : defaultValues
              ? "保存修改"
              : "创建任务"}
        </Button>
      </div>
    </form>
  )
}