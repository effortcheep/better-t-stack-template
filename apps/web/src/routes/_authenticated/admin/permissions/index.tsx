import { createFileRoute } from "@tanstack/react-router"
import { ROLE_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import PermissionListPage from "@/features/admin/pages/permissions"

export const Route = createFileRoute("/_authenticated/admin/permissions/")({
  beforeLoad: () => {
    requirePermission(ROLE_PERMISSIONS.read)
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "权限码管理" },
    ],
  },
  component: PermissionListPage,
})