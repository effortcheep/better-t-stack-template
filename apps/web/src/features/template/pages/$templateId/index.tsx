import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@better-t-stack-template/ui/components/empty"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@better-t-stack-template/ui/components/field"
import { Skeleton } from "@better-t-stack-template/ui/components/skeleton"
import {
  Link,
  useNavigate,
} from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  FileTextIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import * as React from "react"

import {
  PriorityBadge,
  PublishedBadge,
  ReviewStatusBadge,
  StatusBadge,
  TagBadge,
} from "@/features/template/components/template-badges"
import { useDeleteTemplate, useTemplate } from "@/features/template/api"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

export interface TemplateDetailPageProps {
  templateId: string
}

export default function TemplateDetailPage({
  templateId,
}: TemplateDetailPageProps) {
  const id = Number(templateId)
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState(false)
  const { data, isLoading } = useTemplate(id)
  const deleteMutation = useDeleteTemplate()

  if (isLoading) {
    return (
      <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
        <div className="grid gap-6 @md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          <div className="grid gap-4 @md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>
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
            <EmptyTitle>模板不存在</EmptyTitle>
            <EmptyDescription>
              该模板可能已被删除
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => navigate({ to: "/template" })}
            >
              返回列表
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const formatDate = (value: Date) =>
    new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value)

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="mb-1 -ml-2"
            render={<Link to="/template" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span className="sr-only">返回列表</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            创建于 {formatDate(data.createdAt)} · 更新于{" "}
            {formatDate(data.updatedAt)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={data.status} />
            <PriorityBadge priority={data.priority} />
            <PublishedBadge published={data.published} />
            <ReviewStatusBadge
              reviewStatus={data.reviewStatus}
            />
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                to="/template/$templateId/update"
                params={{ templateId }}
              />
            }
          >
            <PencilIcon data-icon="inline-start" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2Icon
              data-icon="inline-start"
              className="text-destructive"
            />
            <span className="text-destructive">
              {deleteMutation.isPending
                ? "删除中…"
                : "删除"}
            </span>
          </Button>
        </div>
      </div>

      {/* 内容 */}
      <div className="grid gap-6 @md:grid-cols-2">
        {/* 内容 */}
        <section>
          <Field orientation="vertical">
            <FieldLabel>内容</FieldLabel>
            <FieldContent>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.content}
                </p>
              </div>
            </FieldContent>
          </Field>
        </section>

        {/* 属性 */}
        <section>
          <div className="grid gap-x-6 gap-y-3 @md:grid-cols-2">
            <Field orientation="vertical">
              <FieldLabel>状态</FieldLabel>
              <FieldContent>
                <StatusBadge status={data.status} />
                <FieldDescription>
                  {data.status === "published"
                    ? "对外可见"
                    : data.status === "draft"
                      ? "仅后台可见"
                      : "已归档，不再显示"}
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field orientation="vertical">
              <FieldLabel>优先级</FieldLabel>
              <FieldContent>
                <PriorityBadge priority={data.priority} />
              </FieldContent>
            </Field>

            <Field orientation="vertical">
              <FieldLabel>发布状态</FieldLabel>
              <FieldContent>
                <PublishedBadge
                  published={data.published}
                />
              </FieldContent>
            </Field>

            <Field orientation="vertical">
              <FieldLabel>审核状态</FieldLabel>
              <FieldContent>
                <ReviewStatusBadge
                  reviewStatus={data.reviewStatus}
                />
                <FieldDescription>
                  {data.reviewStatus === "approved"
                    ? "已通过审核"
                    : data.reviewStatus === "rejected"
                      ? "未通过审核"
                      : data.reviewStatus === "reviewing"
                        ? "正在审核中"
                        : "尚未提交审核"}
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field
              orientation="vertical"
              className="@md:col-span-2"
            >
              <FieldLabel>标签</FieldLabel>
              <FieldContent>
                {data.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.tags.map((tag) => (
                      <TagBadge key={tag} value={tag} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    —
                  </p>
                )}
              </FieldContent>
            </Field>

            {data.coverImage && (
              <Field
                orientation="vertical"
                className="@md:col-span-2"
              >
                <FieldLabel>封面图片</FieldLabel>
                <FieldContent>
                  <div className="flex w-fit items-center gap-2.5 rounded-lg border bg-muted/30 p-2.5 pr-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                      <FileTextIcon className="size-4.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {data.coverImage.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(
                          data.coverImage.size / 1024
                        ).toFixed(0)}{" "}
                        KB
                      </p>
                    </div>
                  </div>
                </FieldContent>
              </Field>
            )}
          </div>
        </section>
      </div>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          deleteMutation.mutate(id, {
            onSuccess: () => navigate({ to: "/template" }),
          })
        }}
      />
    </div>
  )
}