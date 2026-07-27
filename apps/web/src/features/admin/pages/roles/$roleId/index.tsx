import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@better-t-stack-template/ui/components/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@better-t-stack-template/ui/components/empty"
import { Skeleton } from "@better-t-stack-template/ui/components/skeleton"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import * as React from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { useDeleteRole, useRole } from "@/features/admin/role-api"
import { RolePermissionsCard } from "@/features/admin/components/role/role-permissions-card"

export interface RoleDetailPageProps {
  roleId: string
}

export default function RoleDetailPage({
  roleId,
}: RoleDetailPageProps) {
  const navigate = useNavigate()
  const [showDeleteDialog, setShowDeleteDialog] =
    React.useState(false)
  const { data, isLoading } = useRole(roleId)
  const deleteMutation = useDeleteRole()

  if (isLoading) {
    return (
      <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-20 w-full rounded-lg" />
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
            <EmptyTitle>角色不存在</EmptyTitle>
            <EmptyDescription>
              该角色可能已被删除
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              render={
                <Link to="/admin/roles" />
              }
            >
              返回列表
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value))

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="mb-1 -ml-2"
            nativeButton={false}
            render={<Link to="/admin/roles" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span className="sr-only">返回列表</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            创建于 {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/admin/roles/$roleId/update"
                params={{ roleId }}
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

      {/* 角色信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">角色信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-muted-foreground">
              角色名称
            </span>
            <p className="text-sm">{data.name}</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-muted-foreground">
              描述
            </span>
            <p className="text-sm">
              {data.description || (
                <span className="text-muted-foreground">—</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <RolePermissionsCard roleId={roleId} />

      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          deleteMutation.mutate(roleId, {
            onSuccess: () => navigate({ to: "/admin/roles" }),
          })
        }}
        description={`确定要删除角色「${data.name}」吗？此操作不可撤销。`}
      />
    </div>
  )
}