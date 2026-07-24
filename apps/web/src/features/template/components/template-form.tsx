"use client"

import { Button } from "@better-t-stack-template/ui/components/button"
import { Checkbox } from "@better-t-stack-template/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@better-t-stack-template/ui/components/field"
import { Input } from "@better-t-stack-template/ui/components/input"
import {
  RadioGroup,
  RadioGroupItem,
} from "@better-t-stack-template/ui/components/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@better-t-stack-template/ui/components/select"
import { Switch } from "@better-t-stack-template/ui/components/switch"
import { Textarea } from "@better-t-stack-template/ui/components/textarea"
import { cn } from "@better-t-stack-template/ui/lib/utils"
import { useForm } from "@tanstack/react-form"
import {
  FileTextIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type {
  TemplateCreateInput,
  TemplateRecord,
} from "@/features/template/types"
import {
  PRIORITY_OPTIONS,
  REVIEW_STATUS_OPTIONS,
  STATUS_OPTIONS,
  TAG_OPTIONS,
} from "@/features/template/types"

interface TemplateFormProps {
  defaultValues?: TemplateRecord
  onSubmit: (
    values: TemplateCreateInput,
  ) => void | Promise<void>
  isPending?: boolean
  onDirtyChange?: (dirty: boolean) => void
  onCancel?: () => void
}
export function TemplateForm({
  defaultValues,
  onSubmit: onSubmitProp,
  isPending,
  onDirtyChange,
  onCancel,
}: TemplateFormProps) {
  const [coverImage, setCoverImage] = useState<File | null>(
    defaultValues?.coverImage ?? null,
  )
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<
    string | null
  >(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      status: defaultValues?.status ?? ("draft" as const),
      priority:
        defaultValues?.priority ?? ("medium" as const),
      tags: defaultValues?.tags ?? ([] as string[]),
      published: defaultValues?.published ?? false,
      reviewStatus:
        defaultValues?.reviewStatus ?? ("pending" as const),
    },
    onSubmit: ({ value }) => {
      onSubmitProp({ ...value, coverImage })
    },
  })

  // 已选图片 → 生成预览缩略图
  useEffect(() => {
    if (
      coverImage &&
      coverImage.type.startsWith("image/")
    ) {
      const url = URL.createObjectURL(coverImage)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [coverImage])

  // 未保存变更时阻止意外关闭/刷新
  useEffect(() => {
    if (!form.state.isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () =>
      window.removeEventListener("beforeunload", handler)
  }, [form.state.isDirty])

  // 表单变更状态通知父组件
  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty])

  const handleReset = () => {
    form.reset()
    setCoverImage(defaultValues?.coverImage ?? null)
    setPreviewUrl(null)
  }

  const pickFile = () => inputRef.current?.click()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      {/* ====== 基本信息 ====== */}
      <FieldGroup>
        <div className="grid gap-4 @md/field-group:grid-cols-2">
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "标题不能为空"
                  : value.length < 2
                    ? "标题至少 2 个字符"
                    : undefined,
            }}
            children={(field) => (
              <Field
                orientation="vertical"
                data-invalid={
                  !!field.state.meta.errors.length
                }
              >
                <FieldLabel htmlFor="title">
                  标题
                  <span className="ml-0.5 text-destructive">
                    *
                  </span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="title"
                    name="title"
                    value={field.state.value}
                    placeholder="输入模板标题…"
                    aria-invalid={
                      !!field.state.meta.errors.length
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(
                        field.state.meta.errors as Array<
                          string | undefined
                        >
                      ).map((er) => ({
                        message:
                          typeof er === "string"
                            ? er
                            : "格式不正确",
                      }))}
                    />
                  ) : (
                    <FieldDescription>
                      2 个字符以上
                    </FieldDescription>
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <form.Field
            name="content"
            validators={{
              onChange: ({ value }) =>
                !value ? "内容不能为空" : undefined,
            }}
            children={(field) => (
              <Field
                orientation="vertical"
                data-invalid={
                  !!field.state.meta.errors.length
                }
              >
                <FieldLabel htmlFor="content">
                  内容
                  <span className="ml-0.5 text-destructive">
                    *
                  </span>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="content"
                    name="content"
                    value={field.state.value}
                    placeholder="输入详细内容…"
                    rows={5}
                    aria-invalid={
                      !!field.state.meta.errors.length
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  />
                  {field.state.meta.errors.length > 0 ? (
                    <FieldError
                      errors={(
                        field.state.meta.errors as Array<
                          string | undefined
                        >
                      ).map((er) => ({
                        message:
                          typeof er === "string"
                            ? er
                            : "格式不正确",
                      }))}
                    />
                  ) : (
                    <FieldDescription>
                      支持多行文本
                    </FieldDescription>
                  )}
                </FieldContent>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      {/* ====== 属性设置 ====== */}
      <FieldGroup>
        <div className="grid gap-4 @md/field-group:grid-cols-2">
          <form.Field
            name="status"
            children={(field) => (
              <Field orientation="vertical">
                <FieldLabel htmlFor="status">
                  状态
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as TemplateRecord["status"],
                      )
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {STATUS_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    草稿仅在后台可见
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />

          <form.Field
            name="priority"
            children={(field) => (
              <Field orientation="vertical">
                <FieldLabel>优先级</FieldLabel>
                <FieldContent>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as TemplateRecord["priority"],
                      )
                    }
                    className="flex gap-6 pt-1.5"
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <Field
                        key={o.value}
                        orientation="horizontal"
                        className="items-center"
                      >
                        <RadioGroupItem
                          value={o.value}
                          id={`priority-${o.value}`}
                        />
                        <FieldLabel
                          htmlFor={`priority-${o.value}`}
                        >
                          {o.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                  <FieldDescription>
                    决定处理顺序
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />

          <form.Field
            name="reviewStatus"
            children={(field) => (
              <Field orientation="vertical">
                <FieldLabel htmlFor="reviewStatus">
                  审核状态
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as TemplateRecord["reviewStatus"],
                      )
                    }
                  >
                    <SelectTrigger
                      id="reviewStatus"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {REVIEW_STATUS_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    模板发布前需通过审核
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />

          <form.Field
            name="published"
            children={(field) => (
              <Field orientation="vertical">
                <FieldLabel htmlFor="published">
                  发布
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      id="published"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked)
                      }
                    />
                    <FieldLabel
                      htmlFor="published"
                      className="text-sm"
                    >
                      {field.state.value
                        ? "已发布"
                        : "未发布"}
                    </FieldLabel>
                  </div>
                  <FieldDescription>
                    开启后对外可见
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />

          <div className="@md/field-group:col-span-2">
            <form.Field
              name="tags"
              children={(field) => (
                <Field orientation="vertical">
                  <FieldLabel>标签</FieldLabel>
                  <FieldContent>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                      {TAG_OPTIONS.map((tag) => (
                        <Field
                          key={tag.value}
                          orientation="horizontal"
                          className="items-center"
                        >
                          <Checkbox
                            id={`tag-${tag.value}`}
                            checked={field.state.value.includes(
                              tag.value,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.handleChange([
                                  ...field.state.value,
                                  tag.value,
                                ])
                              } else {
                                field.handleChange(
                                  field.state.value.filter(
                                    (v) => v !== tag.value,
                                  ),
                                )
                              }
                            }}
                          />
                          <FieldLabel
                            htmlFor={`tag-${tag.value}`}
                          >
                            {tag.label}
                          </FieldLabel>
                        </Field>
                      ))}
                    </div>
                    <FieldDescription>
                      可多选，用于分类筛选
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 @md/field-group:grid-cols-2">
          <Field orientation="vertical">
            <FieldLabel htmlFor="coverImage">
              封面图片
            </FieldLabel>
            <FieldContent>
              <div
                role="button"
                tabIndex={0}
                onClick={pickFile}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    pickFile()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                  const file =
                    e.dataTransfer.files?.[0] ?? null
                  if (file) setCoverImage(file)
                }}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/40",
                )}
              >
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={coverImage?.name}
                      className="size-full object-cover"
                    />
                  ) : coverImage ? (
                    <FileTextIcon className="size-6 text-muted-foreground" />
                  ) : (
                    <UploadIcon className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {coverImage ? (
                    <>
                      <p className="truncate text-sm font-medium">
                        {coverImage.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(coverImage.size / 1024).toFixed(
                          0,
                        )}{" "}
                        KB · 点击或拖拽替换
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      拖放文件到此处，或点击选择
                    </p>
                  )}
                </div>
                {coverImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="relative shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCoverImage(null)
                      setPreviewUrl(null)
                      if (inputRef.current)
                        inputRef.current.value = ""
                    }}
                    aria-label="移除封面图片"
                  >
                    <XIcon />
                  </Button>
                )}
                <Input
                  ref={inputRef}
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    if (file) setCoverImage(file)
                  }}
                />
              </div>
              <FieldDescription>
                支持 JPG、PNG，最大 5MB
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>

      {/* ====== 操作栏 ====== */}
      <div className="flex items-center gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            返回
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
        >
          重置
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "保存中…"
            : defaultValues
              ? "保存修改"
              : "创建模板"}
        </Button>
      </div>
    </form>
  )
}
