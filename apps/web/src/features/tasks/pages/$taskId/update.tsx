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
import { useNavigate } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"
import { useState } from "react"

import { TaskForm } from "@/features/tasks/components/task-form"
import { useTask, useUpdateTask } from "@/features/tasks/api"

export interface UpdateTaskPageProps {
  taskId: string
}

export default function UpdateTaskPage({
  taskId,
}: UpdateTaskPageProps) {
  const id = Number(taskId)
  const navigate = useNavigate()
  const { data, isLoading } = useTask(id)
  const updateMutation = useUpdateTask()
  const [isDirty, setIsDirty] = useState(false)

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

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            编辑任务
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDirty
              ? "有未保存的修改"
              : `正在编辑「${data.name}」`}
          </p>
        </div>
      </div>

      <TaskForm
        defaultValues={data}
        onSubmit={(values) =>
          updateMutation.mutate(
            { id, input: values },
            {
              onSuccess: () =>
                navigate({ to: "/tasks" }),
            },
          )
        }
        isPending={updateMutation.isPending}
        onDirtyChange={setIsDirty}
        onCancel={() => navigate({ to: "/tasks" })}
      />
    </div>
  )
}