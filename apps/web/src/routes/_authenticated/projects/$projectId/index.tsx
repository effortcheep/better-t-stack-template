import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import ProjectDetailPage from "@/features/projects/pages/$projectId"

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/",
)({
  beforeLoad: () => {
    requirePermission("tasks:read")
  },
  staticData: {
    breadcrumbs: [
      { label: "项目管理", href: "/projects" },
      { label: "详情" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  return <ProjectDetailPage projectId={projectId} />
}