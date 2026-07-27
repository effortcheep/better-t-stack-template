import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import AdminListPage from "@/features/admin/pages"

export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: () => {
    requirePermission("users:assign")
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "管理员列表" },
    ],
  },
  component: AdminListPage,
})
