// CRUD 模板实体类型定义
// 复制此文件后替换 TemplateRecord 和字段名即可适配新的实体

export type TemplateRecord = {
  id: number
  title: string
  content: string
  status: "draft" | "published" | "archived"
  priority: "low" | "medium" | "high"
  tags: string[]
  published: boolean
  reviewStatus: "pending" | "reviewing" | "approved" | "rejected"
  coverImage: File | null
  createdAt: Date
  updatedAt: Date
}

export type TemplateCreateInput = Pick<
  TemplateRecord,
  "title" | "content" | "status" | "priority" | "tags" | "published" | "reviewStatus"
> & { coverImage?: File | null }

export type TemplateUpdateInput = Partial<TemplateCreateInput>

export const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
] as const

export const PRIORITY_OPTIONS = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
] as const

export const REVIEW_STATUS_OPTIONS = [
  { value: "pending", label: "待审核" },
  { value: "reviewing", label: "审核中" },
  { value: "approved", label: "审核通过" },
  { value: "rejected", label: "审核拒绝" },
] as const

export const TAG_OPTIONS = [
  { value: "react", label: "React" },
  { value: "typescript", label: "TypeScript" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "shadcn", label: "shadcn/ui" },
] as const

/** 列表查询参数 */
export type TemplateListParams = {
  search?: string
  status?: TemplateRecord["status"] | "all"
  priority?: TemplateRecord["priority"] | "all"
  page?: number
  pageSize?: number
}

/** 列表查询响应 */
export type TemplateListResponse = {
  items: TemplateRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}