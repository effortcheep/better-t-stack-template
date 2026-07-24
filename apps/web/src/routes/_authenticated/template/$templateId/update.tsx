import { createFileRoute } from "@tanstack/react-router"

import UpdateTemplatePage from "@/pages/_authenticated/template/$templateId/update"

export const Route = createFileRoute(
  "/_authenticated/template/$templateId/update",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { templateId } = Route.useParams()
  return <UpdateTemplatePage templateId={templateId} />
}
