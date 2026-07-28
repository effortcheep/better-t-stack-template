import { createFileRoute } from "@tanstack/react-router"
import { ROLE_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import RoleDetailPage from "@/features/admin/pages/roles/$roleId"

export const Route = createFileRoute("/_authenticated/admin/roles/$roleId")({
  beforeLoad: () => {
    requirePermission(ROLE_PERMISSIONS.read)
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "角色管理", href: "/admin/roles" },
      { label: "角色详情" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  return <RoleDetailPage roleId={roleId} />
}