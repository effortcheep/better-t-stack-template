import { createFileRoute } from "@tanstack/react-router"

import AdminListPage from "@/features/admin/pages"

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminListPage,
})