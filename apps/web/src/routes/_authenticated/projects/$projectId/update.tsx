import { createFileRoute } from "@tanstack/react-router"

import ProjectUpdatePage from "@/features/projects/pages/$projectId/update"

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/update",
)({
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