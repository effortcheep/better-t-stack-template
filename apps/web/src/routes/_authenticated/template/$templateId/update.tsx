import { createFileRoute } from "@tanstack/react-router"
import { TEMPLATE_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import UpdateTemplatePage from "@/features/template/pages/$templateId/update"

export const Route = createFileRoute(
  "/_authenticated/template/$templateId/update",
)({
  beforeLoad: () => {
    requirePermission(TEMPLATE_PERMISSIONS.update)
  },
  staticData: { breadcrumbs: [{ label: "模板管理", href: "/template" }, { label: "编辑" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const { templateId } = Route.useParams()
  return <UpdateTemplatePage templateId={templateId} />
}
