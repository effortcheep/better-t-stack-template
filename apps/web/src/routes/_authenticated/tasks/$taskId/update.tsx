import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import UpdateTaskPage from "@/features/tasks/pages/$taskId/update"

export const Route = createFileRoute(
  "/_authenticated/tasks/$taskId/update",
)({
  beforeLoad: () => {
    requirePermission("tasks:update")
  },
  staticData: { breadcrumbs: [{ label: "任务管理", href: "/tasks" }, { label: "编辑" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const { taskId } = Route.useParams()
  return <UpdateTaskPage taskId={taskId} />
}