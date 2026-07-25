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
  FieldLabel,
} from "@better-t-stack-template/ui/components/field"
import { Skeleton } from "@better-t-stack-template/ui/components/skeleton"
import {
  Link,
  useNavigate,
} from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import * as React from "react"

import { useDeleteTask, useTask } from "@/features/tasks/api"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

export interface TaskDetailPageProps {
  taskId: string
}

export default function TaskDetailPage({
  taskId,
}: TaskDetailPageProps) {
  const id = Number(taskId)
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState(false)
  const { data, isLoading } = useTask(id)
  const deleteMutation = useDeleteTask()

  if (isLoading) {
    return (
      <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-full rounded-lg" />
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
            <EmptyTitle>任务不存在</EmptyTitle>
            <EmptyDescription>
              该任务可能已被删除
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => navigate({ to: "/tasks" })}
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
            render={<Link to="/tasks" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span className="sr-only">返回列表</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            创建于 {formatDate(data.createdAt)} · 更新于{" "}
            {formatDate(data.updatedAt)}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                to="/tasks/$taskId/update"
                params={{ taskId }}
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

      {/* 详情 */}
      <div className="grid gap-6">
        <div className="grid gap-x-6 gap-y-3">
          <Field orientation="vertical">
            <FieldLabel>ID</FieldLabel>
            <FieldContent>
              <p className="text-sm">{data.id}</p>
            </FieldContent>
          </Field>
          <Field orientation="vertical">
            <FieldLabel>名称</FieldLabel>
            <FieldContent>
              <p className="text-sm">{data.name}</p>
            </FieldContent>
          </Field>
          <Field orientation="vertical">
            <FieldLabel>完成状态</FieldLabel>
            <FieldContent>
              <p className="text-sm">
                {data.done ? "已完成" : "未完成"}
              </p>
            </FieldContent>
          </Field>
          <Field orientation="vertical">
            <FieldLabel>创建时间</FieldLabel>
            <FieldContent>
              <p className="text-sm">
                {formatDate(data.createdAt)}
              </p>
            </FieldContent>
          </Field>
          <Field orientation="vertical">
            <FieldLabel>更新时间</FieldLabel>
            <FieldContent>
              <p className="text-sm">
                {formatDate(data.updatedAt)}
              </p>
            </FieldContent>
          </Field>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          deleteMutation.mutate(id, {
            onSuccess: () => navigate({ to: "/tasks" }),
          })
        }}
      />
    </div>
  )
}