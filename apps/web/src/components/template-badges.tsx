import { Badge } from "@better-t-stack-template/ui/components/badge"
import { cn } from "@better-t-stack-template/ui/lib/utils"

import {
  PRIORITY_OPTIONS,
  REVIEW_STATUS_OPTIONS,
  STATUS_OPTIONS,
  TAG_OPTIONS,
} from "@/lib/template-types"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"

/** 把标签值（如 "react"）映射为可读标签（如 "React"） */
export function tagLabel(value: string): string {
  return TAG_OPTIONS.find((t) => t.value === value)?.label ?? value
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const label =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status
  const variant: BadgeVariant =
    status === "published"
      ? "default"
      : status === "draft"
        ? "secondary"
        : "outline"
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string
  className?: string
}) {
  const label =
    PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? priority
  const variant: BadgeVariant =
    priority === "high"
      ? "destructive"
      : priority === "medium"
        ? "default"
        : "secondary"
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}

export function TagBadge({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <Badge variant="secondary" className={className}>
      {tagLabel(value)}
    </Badge>
  )
}

export function PublishedBadge({
  published,
  className,
}: {
  published: boolean
  className?: string
}) {
  return (
    <Badge variant={published ? "default" : "secondary"} className={className}>
      {published ? "已发布" : "未发布"}
    </Badge>
  )
}

export function ReviewStatusBadge({
  reviewStatus,
  className,
}: {
  reviewStatus: string
  className?: string
}) {
  const label =
    REVIEW_STATUS_OPTIONS.find((s) => s.value === reviewStatus)?.label ??
    reviewStatus
  const tone = cn(
    reviewStatus === "approved"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : reviewStatus === "rejected"
        ? "bg-destructive/10 text-destructive"
        : reviewStatus === "reviewing"
          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          : "bg-muted text-muted-foreground",
    className,
  )
  return (
    <Badge variant="secondary" className={tone}>
      {label}
    </Badge>
  )
}
