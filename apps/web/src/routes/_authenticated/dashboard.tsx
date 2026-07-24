import { createFileRoute } from "@tanstack/react-router"

import DashboardPage from "@/pages/_authenticated/dashboard"

export const Route = createFileRoute(
  "/_authenticated/dashboard",
)({
  component: DashboardPage,
})
