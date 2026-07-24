import { createFileRoute } from "@tanstack/react-router"

import UserDetailPage from "@/features/users/pages/$userId"

export const Route = createFileRoute("/_authenticated/users/$userId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  return <UserDetailPage userId={userId} />
}