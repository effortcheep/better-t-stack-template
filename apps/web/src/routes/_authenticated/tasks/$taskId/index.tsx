import { createFileRoute } from "@tanstack/react-router"
import { TASK_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import TaskDetailPage from "@/features/tasks/pages/$taskId"

export const Route = createFileRoute(
  "/_authenticated/tasks/$taskId/",
)({
  beforeLoad: () => {
    requirePermission(TASK_PERMISSIONS.read)
  },
  staticData: { breadcrumbs: [{ label: "任务管理", href: "/tasks" }, { label: "详情" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const { taskId } = Route.useParams()
  return <TaskDetailPage taskId={taskId} />
}