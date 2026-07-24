import { createFileRoute } from "@tanstack/react-router"

import AdminUpdatePage from "@/features/admin/pages/$adminId/update"

export const Route = createFileRoute(
  "/_authenticated/admin/$adminId/update",
)({
  staticData: {
    breadcrumbs: [
      { label: "\u7ba1\u7406\u5458", href: "/admin" },
      { label: "\u7f16\u8f91" },
    ],
  },
  component: RouteComponent,
})
function RouteComponent() {
  const { adminId } = Route.useParams()
  return <AdminUpdatePage adminId={adminId} />
}