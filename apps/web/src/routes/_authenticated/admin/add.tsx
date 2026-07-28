import { createFileRoute } from "@tanstack/react-router"
import { USER_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import AdminAddPage from "@/features/admin/pages/add"

export const Route = createFileRoute("/_authenticated/admin/add")({
  beforeLoad: () => {
    requirePermission(USER_PERMISSIONS.create)
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "新建管理员" },
    ],
  },
  component: AdminAddPage,
})
