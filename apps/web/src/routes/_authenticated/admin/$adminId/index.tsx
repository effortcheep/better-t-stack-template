import { createFileRoute } from "@tanstack/react-router"

import AdminDetailPage from "@/features/admin/pages/$adminId"

export const Route = createFileRoute("/_authenticated/admin/$adminId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { adminId } = Route.useParams()
  return <AdminDetailPage adminId={adminId} />
}