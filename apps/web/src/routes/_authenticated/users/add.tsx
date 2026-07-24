import { createFileRoute } from "@tanstack/react-router"

import UserAddPage from "@/features/users/pages/add"

export const Route = createFileRoute("/_authenticated/users/add")({
  component: UserAddPage,
})