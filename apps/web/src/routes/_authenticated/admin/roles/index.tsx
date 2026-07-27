import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import RoleListPage from "@/features/admin/pages/roles"

export const Route = createFileRoute("/_authenticated/admin/roles/")({
  beforeLoad: () => {
    requirePermission("roles:read")
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "角色管理" },
    ],
  },
  component: RoleListPage,
})