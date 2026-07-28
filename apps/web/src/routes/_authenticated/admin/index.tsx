import { createFileRoute } from "@tanstack/react-router"
import { USER_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import AdminListPage from "@/features/admin/pages"

export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: () => {
    requirePermission(USER_PERMISSIONS.read)
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "管理员列表" },
    ],
  },
  component: AdminListPage,
})
