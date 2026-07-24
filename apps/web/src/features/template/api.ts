// TanStack Query hooks — 当前为 mock 实现
// 后续替换 fetch 调用即可对接后端 API

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type {
  TemplateCreateInput,
  TemplateListParams,
  TemplateListResponse,
  TemplateRecord,
  TemplateUpdateInput,
} from "@/features/template/types"

// 模拟数据 — 生成 23 条以演示分页
let nextId = 24
const STATUSES = ["draft", "published", "archived"] as const
const PRIORITIES = ["low", "medium", "high"] as const
const REVIEW_STATUSES = ["pending", "reviewing", "approved", "rejected"] as const
const TAG_POOL = ["react", "typescript", "tailwind", "shadcn"]
const TITLES = [
  "更好的 T-Stack 模板",
  "shadcn/ui 组件指南",
  "TanStack Router 入门",
  "React Query 最佳实践",
  "Tailwind CSS 技巧合集",
  "TypeScript 类型体操",
  "Hono API 设计模式",
  "Drizzle ORM 迁移指南",
  "Better Auth 集成方案",
  "前端性能优化清单",
  "React 服务端组件探索",
  "全栈项目结构规范",
  "Zod 校验模式实战",
  "Vite 插件开发教程",
  "CSS Grid 布局精要",
  "CI/CD 流水线设计",
  "Git 工作流规范",
  "测试金字塔策略",
  "Monorepo 管理实践",
  "错误边界与异常处理",
  "无障碍设计指南",
  "国际化方案对比",
  "暗色模式实现详解",
]

function randomTags(): string[] {
  const count = Math.floor(Math.random() * 3) + 1
  return TAG_POOL.slice(0, count)
}

const mockData: TemplateRecord[] = TITLES.map((title, i) => ({
  id: i + 1,
  title,
  content: `${title}的详细内容说明…`,
  status: STATUSES[i % 3] as TemplateRecord["status"],
  priority: PRIORITIES[i % 3] as TemplateRecord["priority"],
  tags: randomTags(),
  published: i % 4 !== 0,
  reviewStatus: REVIEW_STATUSES[i % 4] as TemplateRecord["reviewStatus"],
  coverImage: null,
  createdAt: new Date(2026, 6, 1 + (i % 20)),
  updatedAt: new Date(2026, 6, 20 - i),
}))

// 模拟延迟
function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>()
  setTimeout(resolve, ms)
  return promise
}

// ========== 查询 Hooks ==========

export function useTemplateList(params: TemplateListParams = {}) {
  const {
    search = "",
    status = "all",
    priority = "all",
    page = 1,
    pageSize = 8,
  } = params

  return useQuery({
    queryKey: ["templates", { search, status, priority, page, pageSize }],
    queryFn: async (): Promise<TemplateListResponse> => {
      await delay(300)

      let filtered = [...mockData]

      // 搜索：匹配标题
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter((item) =>
          item.title.toLowerCase().includes(q),
        )
      }

      // 筛选：状态
      if (status !== "all") {
        filtered = filtered.filter((item) => item.status === status)
      }

      // 筛选：优先级
      if (priority !== "all") {
        filtered = filtered.filter((item) => item.priority === priority)
      }

      const total = filtered.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const start = (page - 1) * pageSize
      const items = filtered.slice(start, start + pageSize)

      return { items, total, page, pageSize, totalPages }
    },
  })
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: async (): Promise<TemplateRecord | undefined> => {
      await delay(200)
      return mockData.find((item) => item.id === id)
    },
    enabled: !!id,
  })
}

// ========== 变更 Hooks ==========

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TemplateCreateInput) => {
      const newItem: TemplateRecord = {
        ...input,
        id: nextId++,
        coverImage: input.coverImage ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockData.unshift(newItem)
      return newItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      toast.success("创建成功")
    },
    onError: () => {
      toast.error("创建失败")
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number
      input: TemplateUpdateInput
    }) => {
      const index = mockData.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockData[index] = {
          ...mockData[index],
          ...input,
          updatedAt: new Date(),
        }
      }
      return mockData[index]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      toast.success("更新成功")
    },
    onError: () => {
      toast.error("更新失败")
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const index = mockData.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockData.splice(index, 1)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      toast.success("删除成功")
    },
    onError: () => {
      toast.error("删除失败")
    },
  })
}