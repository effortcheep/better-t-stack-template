import { createFileRoute } from "@tanstack/react-router"

import UserUpdatePage from "@/features/users/pages/$userId/update"

export const Route = createFileRoute(
  "/_authenticated/users/$userId/update",
)({
  staticData: {
    breadcrumbs: [
      { label: "用户管理", href: "/users" },
      { label: "编辑" },
    ],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  return <UserUpdatePage userId={userId} />
}