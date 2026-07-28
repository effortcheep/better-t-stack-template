import { createFileRoute } from "@tanstack/react-router"
import { TEMPLATE_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import TemplateDetailPage from "@/features/template/pages/$templateId"

export const Route = createFileRoute(
  "/_authenticated/template/$templateId/",
)({
  beforeLoad: () => {
    requirePermission(TEMPLATE_PERMISSIONS.read)
  },
  staticData: { breadcrumbs: [{ label: "模板管理", href: "/template" }, { label: "详情" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const { templateId } = Route.useParams()
  return <TemplateDetailPage templateId={templateId} />
}
