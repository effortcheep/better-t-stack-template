import { createFileRoute } from "@tanstack/react-router"

import DashboardPage from "@/features/dashboard/pages/dashboard"

export const Route = createFileRoute(
  "/_authenticated/dashboard",
)({
  staticData: { breadcrumbs: [{ label: "仪表盘" }] },
  component: DashboardPage,
})
