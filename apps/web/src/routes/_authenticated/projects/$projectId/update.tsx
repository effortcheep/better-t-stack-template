import { createFileRoute } from "@tanstack/react-router"

import ProjectUpdatePage from "@/features/projects/pages/$projectId/update"

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/update",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  return <ProjectUpdatePage projectId={projectId} />
}