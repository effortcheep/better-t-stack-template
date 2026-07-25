import { createFileRoute } from "@tanstack/react-router"

import UpdateTaskPage from "@/features/tasks/pages/$taskId/update"

export const Route = createFileRoute(
  "/_authenticated/tasks/$taskId/update",
)({
  staticData: { breadcrumbs: [{ label: "任务管理", href: "/tasks" }, { label: "编辑" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const { taskId } = Route.useParams()
  return <UpdateTaskPage taskId={taskId} />
}