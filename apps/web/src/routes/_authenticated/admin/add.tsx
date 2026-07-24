import { createFileRoute } from "@tanstack/react-router"

import AdminAddPage from "@/features/admin/pages/add"

export const Route = createFileRoute("/_authenticated/admin/add")({
  component: AdminAddPage,
})