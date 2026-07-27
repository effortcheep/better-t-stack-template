import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import UserDetailPage from "@/features/users/pages/$userId"

export const Route = createFileRoute("/_authenticated/users/$userId/")({
  beforeLoad: () => {
    requirePermission("users:assign")
  },
  staticData: {
    breadcrumbs: [
      { label: "用户管理", href: "/users" },
      { label: "详情" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  return <UserDetailPage userId={userId} />
}