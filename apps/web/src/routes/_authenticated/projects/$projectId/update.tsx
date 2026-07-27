import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import ProjectUpdatePage from "@/features/projects/pages/$projectId/update"

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/update",
)({
  beforeLoad: () => {
    requirePermission("tasks:update")
  },
  staticData: {
    breadcrumbs: [
      { label: "项目管理", href: "/projects" },
      { label: "编辑" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  return <ProjectUpdatePage projectId={projectId} />
}