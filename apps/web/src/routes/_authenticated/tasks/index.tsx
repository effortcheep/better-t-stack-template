import { createFileRoute } from "@tanstack/react-router"
import { TASK_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"
import { z } from "zod"

import TaskListPage from "@/features/tasks/pages"

const searchSchema = z.object({
  search: z.string().default(""),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
})

export const Route = createFileRoute(
  "/_authenticated/tasks/",
)({
  beforeLoad: () => {
    requirePermission(TASK_PERMISSIONS.read)
  },
  validateSearch: searchSchema,
  staticData: { breadcrumbs: [{ label: "任务管理", href: "/tasks" }, { label: "任务列表" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <TaskListPage search={search} navigate={navigate} />
  )
}