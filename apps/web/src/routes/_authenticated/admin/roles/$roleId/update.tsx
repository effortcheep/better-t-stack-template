import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import UpdateRolePage from "@/features/admin/pages/roles/$roleId/update"

export const Route = createFileRoute(
  "/_authenticated/admin/roles/$roleId/update",
)({
  beforeLoad: () => {
    requirePermission("roles:manage")
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "角色管理", href: "/admin/roles" },
      { label: "编辑角色" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  return <UpdateRolePage roleId={roleId} />
}