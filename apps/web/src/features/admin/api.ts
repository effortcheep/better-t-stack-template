// Admin 用户管理 API — TanStack Query hooks

import { env } from "@better-t-stack-template/env/web"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"

import { getToken } from "@/lib/auth"
import { usePermissions } from "@/stores/permissions"
import { useRouter } from "@tanstack/react-router"
import type {
  AssignRoleBody,
  ChangePasswordBody,
  CreateUserBody,
  Role,
  UserDetail,
  UserListQueryInput,
  UserListResponse,
} from "@/features/admin/types"
import {
  roleSchema,
  userDetailSchema,
  userListItemSchema,
  userListResponseSchema,
} from "@/features/admin/types"

const BASE = `${env.VITE_SERVER_URL}/api/v1/admin/users`

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  }
}

// ========== 查询 Hooks ==========

export function useUserList(params: UserListQueryInput = {}) {
  const { search, page = 1, pageSize = 10, sort = "createdAt", order = "desc" } = params
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(page))
  searchParams.set("pageSize", String(pageSize))
  searchParams.set("sort", sort)
  searchParams.set("order", order)
  if (search) searchParams.set("search", search)

  return useQuery({
    queryKey: ["admin-users", { search, page, pageSize, sort, order }],
    queryFn: async (): Promise<UserListResponse> => {
      const res = await fetch(`${BASE}?${searchParams}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取用户列表失败 (${res.status})`)
      const json = await res.json()
      return userListResponseSchema.parse(json.data)
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin-users", id],
    queryFn: async (): Promise<UserDetail> => {
      const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取用户详情失败 (${res.status})`)
      const json = await res.json()
      return userDetailSchema.parse(json.data)
    },
    enabled: !!id,
  })
}

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["admin-users", userId, "roles"],
    queryFn: async (): Promise<Role[]> => {
      const res = await fetch(`${BASE}/${encodeURIComponent(userId)}/roles`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取用户角色失败 (${res.status})`)
      const json = await res.json()
      return z.array(roleSchema).parse(json.data)
    },
    enabled: !!userId,
  })
}

// ========== 变更 Hooks ==========

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateUserBody) => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (json.ret !== 0) throw new Error(json.msg || "创建失败")
      return userListItemSchema.parse(json.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("用户创建成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "创建失败")
    },
  })
}

export function useChangePassword(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ChangePasswordBody) => {
      const res = await fetch(
        `${BASE}/${encodeURIComponent(userId)}/change-password`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(input),
        },
      )
      const json = await res.json()
      if (json.ret !== 0) throw new Error(json.msg || "修改密码失败")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users", userId] })
      toast.success("密码修改成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "修改密码失败")
    },
  })
}

export function useAssignRole() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({
      userId,
      body,
    }: {
      userId: string
      body: AssignRoleBody
    }) => {
      const res = await fetch(
        `${BASE}/${encodeURIComponent(userId)}/roles`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        },
      )
      const json = await res.json()
      if (json.ret !== 0) throw new Error(json.msg || "分配角色失败")
      return roleSchema.parse(json.data)
    },
    onSuccess: async (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-users", vars.userId],
      })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      await usePermissions.getState().refresh()
      await router.invalidate()
      toast.success("角色分配成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "分配角色失败")
    },
  })
}

export function useUnassignRole() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
    }: {
      userId: string
      roleId: string
    }) => {
      const res = await fetch(
        `${BASE}/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      )
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { msg?: string }).msg || "撤销角色失败")
      }
    },
    onSuccess: async (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-users", vars.userId],
      })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      await usePermissions.getState().refresh()
      await router.invalidate()
      toast.success("角色已撤销")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "撤销角色失败")
    },
  })
}