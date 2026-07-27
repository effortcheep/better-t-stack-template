// TanStack Query hooks — 对接后端 /api/v1/roles 接口

import { env } from "@better-t-stack-template/env/web"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"

import { getToken } from "@/lib/auth"
import type {
  RoleCreateInput,
  RoleRecord,
  RoleUpdateInput,
} from "@/features/admin/role-types"
import { envelopeSchema, paginatedSchema } from "@/features/admin/types"

const BASE = `${env.VITE_SERVER_URL}/api/v1/roles`

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  }
}

const roleRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
})

// ========== 查询 Hooks ==========

export type RoleListQueryInput = {
  page?: number
  pageSize?: number
  sort?: "createdAt" | "updatedAt"
  order?: "asc" | "desc"
}

export function useRoleList(params: RoleListQueryInput = {}) {
  const { page = 1, pageSize = 10, sort = "createdAt", order = "desc" } = params
  const searchParams = new URLSearchParams()
  searchParams.set("page", String(page))
  searchParams.set("pageSize", String(pageSize))
  searchParams.set("sort", sort)
  searchParams.set("order", order)

  return useQuery({
    queryKey: ["roles", { page, pageSize, sort, order }],
    queryFn: async () => {
      const res = await fetch(`${BASE}?${searchParams}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取角色列表失败 (${res.status})`)
      const json = await res.json()
      const parsed = envelopeSchema(paginatedSchema(roleRecordSchema)).parse(json)
      return {
        items: parsed.data.items.map(normalizeRole),
        total: parsed.data.total,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
      }
    },
    staleTime: 30_000,
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async (): Promise<RoleRecord | null> => {
      const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取角色详情失败 (${res.status})`)
      const json = await res.json()
      const parsed = envelopeSchema(roleRecordSchema.nullable()).parse(json)
      return parsed.data ? normalizeRole(parsed.data) : null
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ========== 变更 Hooks ==========

export function useCreateRole() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: RoleCreateInput) => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (json.ret !== 0) throw new Error(json.msg || "创建角色失败")
      const parsed = envelopeSchema(roleRecordSchema).parse(json)
      return normalizeRole(parsed.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
      toast.success("角色创建成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "创建角色失败")
    },
  })
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: RoleUpdateInput) => {
      const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (json.ret !== 0) throw new Error(json.msg || "更新角色失败")
      const parsed = envelopeSchema(roleRecordSchema.nullable()).parse(json)
      return parsed.data ? normalizeRole(parsed.data) : null
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
      toast.success("角色更新成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "更新角色失败")
    },
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.status === 204) return
      const json = await res.json().catch(() => ({}))
      throw new Error((json as { msg?: string }).msg || "删除角色失败")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] })
      toast.success("角色已删除")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "删除角色失败")
    },
  })
}

// ========== 角色权限 Hooks ==========

const rolePermissionSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  permission: z.string(),
})

export type RolePermissionRecord = z.infer<typeof rolePermissionSchema>

const permissionModuleSchema = z.object({
  module: z.string(),
  permissions: z.array(
    z.object({
      code: z.string(),
      description: z.string(),
    }),
  ),
})

export type PermissionModuleRecord = z.infer<typeof permissionModuleSchema>

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: async (): Promise<RolePermissionRecord[]> => {
      const res = await fetch(`${BASE}/${encodeURIComponent(roleId)}/permissions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取角色权限失败 (${res.status})`)
      const json = await res.json()
      const parsed = envelopeSchema(z.array(rolePermissionSchema)).parse(json)
      return parsed.data
    },
    enabled: !!roleId,
  })
}

export function useAddRolePermission() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roleId,
      permission,
    }: {
      roleId: string
      permission: string
    }) => {
      const res = await fetch(`${BASE}/${encodeURIComponent(roleId)}/permissions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ permission }),
      })
      const json = await res.json()
      if (json.ret !== 0) throw new Error(json.msg || "添加权限失败")
      const parsed = envelopeSchema(rolePermissionSchema).parse(json)
      return parsed.data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["roles", vars.roleId, "permissions"] })
      toast.success("权限已添加")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "添加权限失败")
    },
  })
}

export function useRemoveRolePermission() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roleId,
      permission,
    }: {
      roleId: string
      permission: string
    }) => {
      const res = await fetch(
        `${BASE}/${encodeURIComponent(roleId)}/permissions/${encodeURIComponent(permission)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      )
      if (res.status === 204) return
      const json = await res.json().catch(() => ({}))
      throw new Error((json as { msg?: string }).msg || "移除权限失败")
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["roles", vars.roleId, "permissions"] })
      toast.success("权限已移除")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "移除权限失败")
    },
  })
}

const PERMISSIONS_BASE = `${env.VITE_SERVER_URL}/api/v1/permissions`

export function usePermissionList() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async (): Promise<PermissionModuleRecord[]> => {
      const res = await fetch(PERMISSIONS_BASE, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取权限码列表失败 (${res.status})`)
      const json = await res.json()
      const parsed = envelopeSchema(z.array(permissionModuleSchema)).parse(json)
      return parsed.data
    },
    staleTime: 300_000,
  })
}

// ========== 辅助函数 ==========

function normalizeRole(data: z.infer<typeof roleRecordSchema>): RoleRecord {
  return {
    ...data,
    description: data.description ?? "",
  }
}
