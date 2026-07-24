import { createFileRoute } from "@tanstack/react-router"

import UserUpdatePage from "@/features/users/pages/$userId/update"

export const Route = createFileRoute(
  "/_authenticated/users/$userId/update",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  return <UserUpdatePage userId={userId} />
}