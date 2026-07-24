import { createFileRoute } from "@tanstack/react-router"

import UserListPage from "@/features/users/pages"

export const Route = createFileRoute("/_authenticated/users/")({
  component: UserListPage,
})