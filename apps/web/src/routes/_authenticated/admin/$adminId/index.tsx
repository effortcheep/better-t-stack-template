import { createFileRoute } from "@tanstack/react-router"

import AdminDetailPage from "@/features/admin/pages/$adminId"

export const Route = createFileRoute("/_authenticated/admin/$adminId/")({
  staticData: {
    breadcrumbs: [
      { label: "\u7ba1\u7406\u5458", href: "/admin" },
      { label: "\u8be6\u60c5" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { adminId } = Route.useParams()
  return <AdminDetailPage adminId={adminId} />
}