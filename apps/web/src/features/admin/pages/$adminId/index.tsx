import { Badge } from "@better-t-stack-template/ui/components/badge"
import { Button } from "@better-t-stack-template/ui/components/button"
import { Card, CardContent } from "@better-t-stack-template/ui/components/card"
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
import { Input } from "@better-t-stack-template/ui/components/input"
import { Skeleton } from "@better-t-stack-template/ui/components/skeleton"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import * as React from "react"

import {
  useAssignRole,
  useUnassignRole,
  useUser,
  useUserRoles,
} from "@/features/admin/api"

export interface AdminDetailPageProps {
  adminId: string
}

export default function AdminDetailPage({
  adminId,
}: AdminDetailPageProps) {
  const { data: user, isLoading } = useUser(adminId)
  const { data: roles = [], isLoading: rolesLoading } =
    useUserRoles(adminId)
  const assignRole = useAssignRole()
  const unassignRole = useUnassignRole()

  const [roleInput, setRoleInput] = React.useState("")

  // ========== 加载态 ==========
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

  // ========== 不存在 ==========
  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 pt-0">
        <Empty>
          <EmptyMedia variant="icon">
            <SearchIcon className="size-8 text-muted-foreground/60" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>用户不存在</EmptyTitle>
            <EmptyDescription>
              该管理员用户已被删除或不存在。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/admin" />}>
              <ArrowLeftIcon data-icon="inline-start" />
              返回列表
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  // ========== 操作 ==========
  const formatDate = (value: Date) =>
    new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value)

  const formatDateTime = (value: Date) =>
    new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(value)

  const handleAssign = async () => {
    const trimmed = roleInput.trim()
    if (!trimmed) return
    try {
      await assignRole.mutateAsync({
        userId: adminId,
        body: { roleId: trimmed },
      })
      setRoleInput("")
    } catch {
      // toast handled by mutation's onError
    }
  }

  const handleUnassign = async (roleId: string) => {
    try {
      await unassignRole.mutateAsync({ userId: adminId, roleId })
    } catch {
      // toast handled by mutation's onError
    }
  }

  // ========== 正常态 ==========
  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="icon"
            className="mb-1 -ml-2"
            render={<Link to="/admin" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span className="sr-only">返回</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            创建于 {formatDate(new Date(user.createdAt))}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                to="/admin/$adminId/update"
                params={{ adminId }}
              />
            }
          >
            <PencilIcon data-icon="inline-start" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                to="/admin/$adminId/update"
                params={{ adminId }}
              />
            }
          >
            <KeyRoundIcon data-icon="inline-start" />
            修改密码
          </Button>
        </div>
      </div>

      {/* 详情 */}
      <div className="grid gap-6 @md:grid-cols-2">
        <section>
          <div className="grid gap-x-6 gap-y-3 @md:grid-cols-2">
            <Field orientation="vertical">
              <FieldLabel>邮箱</FieldLabel>
              <FieldContent>
                <span className="text-sm">{user.email}</span>
              </FieldContent>
            </Field>
            <Field orientation="vertical">
              <FieldLabel>用户名</FieldLabel>
              <FieldContent>
                <span className="text-sm">
                  {user.username ?? "—"}
                </span>
              </FieldContent>
            </Field>
            <Field orientation="vertical">
              <FieldLabel>邮箱验证</FieldLabel>
              <FieldContent>
                {user.emailVerified ? (
                  <Badge variant="outline">已验证</Badge>
                ) : (
                  <Badge variant="secondary">未验证</Badge>
                )}
              </FieldContent>
            </Field>
            <Field orientation="vertical">
              <FieldLabel>创建时间</FieldLabel>
              <FieldContent>
                <span className="text-sm">
                  {formatDateTime(new Date(user.createdAt))}
                </span>
              </FieldContent>
            </Field>
          </div>
        </section>
      </div>

      {/* 角色管理 */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <h3 className="font-semibold">角色分配</h3>
          <div className="flex gap-2">
            <Input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void handleAssign()
                }
              }}
              placeholder="输入角色名称…"
            />
            <Button
              size="sm"
              onClick={() => void handleAssign()}
              disabled={assignRole.isPending || !roleInput.trim()}
            >
              <PlusIcon data-icon="inline-start" />
              {assignRole.isPending ? "分配中…" : "分配"}
            </Button>
          </div>
          {rolesLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              暂无分配角色
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <Badge
                  key={role.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {role.name}
                  <button
                    type="button"
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    onClick={() => handleUnassign(role.id)}
                    disabled={unassignRole.isPending}
                    aria-label={`移除角色 ${role.name}`}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}