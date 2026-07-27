import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import PermissionListPage from "@/features/admin/pages/permissions"

export const Route = createFileRoute("/_authenticated/admin/permissions/")({
  beforeLoad: () => {
    requirePermission("roles:read")
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "权限码管理" },
    ],
  },
  component: PermissionListPage,
})