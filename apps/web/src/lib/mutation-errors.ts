import { toast } from "sonner"
import { z } from "zod"

import { ApiError, formatApiError } from "@/lib/api-client"

const fieldErrorSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
})

/** 422 校验错误 → 字段级提示 (#47) */
export function parseValidationErrors(data: unknown): Record<string, string> {
  const result: Record<string, string> = {}
  const issues = z.array(fieldErrorSchema).safeParse(data)
  if (!issues.success) return result
  for (const issue of issues.data) {
    const key = issue.path.join(".")
    if (key && !result[key]) result[key] = issue.message
  }
  return result
}

export function toastMutationError(err: unknown) {
  toast.error(formatApiError(err))
}

export function isConflictError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409
}
