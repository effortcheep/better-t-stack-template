import { createFileRoute } from "@tanstack/react-router"

import ProjectDetailPage from "@/features/projects/pages/$projectId"

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  return <ProjectDetailPage projectId={projectId} />
}