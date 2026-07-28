import { createFileRoute } from "@tanstack/react-router"
import { USER_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import AdminUpdatePage from "@/features/admin/pages/$adminId/update"

export const Route = createFileRoute(
  "/_authenticated/admin/$adminId/update",
)({
  beforeLoad: () => {
    requirePermission(USER_PERMISSIONS.update)
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "编辑" },
    ],
  },
  component: RouteComponent,
})
function RouteComponent() {
  const { adminId } = Route.useParams()
  return <AdminUpdatePage adminId={adminId} />
}