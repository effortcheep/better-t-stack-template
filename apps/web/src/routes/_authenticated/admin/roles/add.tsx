import { createFileRoute } from "@tanstack/react-router"
import { ROLE_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import AddRolePage from "@/features/admin/pages/roles/add"

export const Route = createFileRoute("/_authenticated/admin/roles/add")({
  beforeLoad: () => {
    requirePermission(ROLE_PERMISSIONS.manage)
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "角色管理", href: "/admin/roles" },
      { label: "新建角色" },
    ],
  },
  component: AddRolePage,
})