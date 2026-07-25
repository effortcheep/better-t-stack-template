// TanStack Query hooks — 调用真实后端 API

import { env } from "@better-t-stack-template/env/web"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getToken } from "@/lib/auth"
import type {
  TaskListParams,
  TaskListResponse,
  TaskRecord,
} from "@/features/tasks/types"
import {
  insertTaskSchema,
  patchTaskSchema,
  selectTaskSchema,
  taskListResponseSchema,
} from "@/features/tasks/types"

const BASE = `${env.VITE_SERVER_URL}/api/v1/tasks`

// ========== 查询 Hooks ==========

export function useTaskList(params: TaskListParams = {}) {
  const { search = "", page = 1, pageSize = 10, sort = "createdAt", order = "desc" } = params

  const searchParams = new URLSearchParams()
  searchParams.set("page", String(page))
  searchParams.set("pageSize", String(pageSize))
  if (sort) searchParams.set("sort", sort)
  if (order) searchParams.set("order", order)
  if (search) searchParams.set("search", search)

  return useQuery({
    queryKey: ["tasks", { search, page, pageSize, sort, order }],
    queryFn: async (): Promise<TaskListResponse> => {
      const res = await fetch(`${BASE}?${searchParams}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`获取任务列表失败 (${res.status})`)
      const json = await res.json()
      return taskListResponseSchema.parse(json)
    },
  })
}

export function useTask(id: number) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async (): Promise<TaskRecord> => {
      const res = await fetch(`${BASE}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        if (res.status === 404) throw new Error("任务不存在")
        throw new Error(`获取任务失败 (${res.status})`)
      }
      const json = await res.json()
      return selectTaskSchema.parse(json)
    },
    enabled: !!id,
  })
}

// ========== 变更 Hooks ==========

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; done: boolean }) => {
      const body = insertTaskSchema.parse(input)
      const res = await fetch(BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `创建任务失败 (${res.status})`)
      }
      const json = await res.json()
      return selectTaskSchema.parse(json)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("任务创建成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "任务创建失败")
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number
      input: { name?: string; done?: boolean }
    }) => {
      const body = patchTaskSchema.parse(input)
      const res = await fetch(`${BASE}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? `更新任务失败 (${res.status})`)
      }
      const json = await res.json()
      return selectTaskSchema.parse(json)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("任务更新成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "任务更新失败")
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok && res.status !== 204) {
        throw new Error(`删除任务失败 (${res.status})`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("任务删除成功")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "任务删除失败")
    },
  })
}