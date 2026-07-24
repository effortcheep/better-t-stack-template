import { createFileRoute } from "@tanstack/react-router"

import AdminUpdatePage from "@/features/admin/pages/$adminId/update"

export const Route = createFileRoute(
  "/_authenticated/admin/$adminId/update",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { adminId } = Route.useParams()
  return <AdminUpdatePage adminId={adminId} />
}