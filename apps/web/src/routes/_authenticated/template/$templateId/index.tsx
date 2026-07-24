import { createFileRoute } from "@tanstack/react-router"

import TemplateDetailPage from "@/pages/_authenticated/template/$templateId"

export const Route = createFileRoute(
  "/_authenticated/template/$templateId/",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { templateId } = Route.useParams()
  return <TemplateDetailPage templateId={templateId} />
}
