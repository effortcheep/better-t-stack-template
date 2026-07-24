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

import { TemplateForm } from "@/features/template/components/template-form"
import { useTemplate, useUpdateTemplate } from "@/features/template/api"

export interface UpdateTemplatePageProps {
  templateId: string
}

export default function UpdateTemplatePage({
  templateId,
}: UpdateTemplatePageProps) {
  const id = Number(templateId)
  const navigate = useNavigate()
  const { data, isLoading } = useTemplate(id)
  const updateMutation = useUpdateTemplate()
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
  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            编辑模板
          </h1>
          <p className="text-sm text-muted-foreground">
            {isDirty
              ? "有未保存的修改"
              : `正在编辑「${data.title}」`}
          </p>
        </div>
      </div>

      <TemplateForm
        defaultValues={data}
        onSubmit={(values) =>
          updateMutation.mutate(
            { id, input: values },
            {
              onSuccess: () =>
                navigate({
                  to: "/template/$templateId",
                  params: { templateId },
                }),
            },
          )
        }
        isPending={updateMutation.isPending}
        onDirtyChange={setIsDirty}
        onCancel={() =>
          navigate({
            to: "/template/$templateId",
            params: { templateId },
          })
        }
      />
    </div>
  )
}