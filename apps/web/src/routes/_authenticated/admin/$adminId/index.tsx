import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import AdminDetailPage from "@/features/admin/pages/$adminId"

export const Route = createFileRoute("/_authenticated/admin/$adminId/")({
  beforeLoad: () => {
    requirePermission("users:assign")
  },
  staticData: {
    breadcrumbs: [
      { label: "管理员", href: "/admin" },
      { label: "详情" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { adminId } = Route.useParams()
  return <AdminDetailPage adminId={adminId} />
}