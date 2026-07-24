import { createFileRoute } from "@tanstack/react-router"

import AdminAddPage from "@/features/admin/pages/add"

export const Route = createFileRoute("/_authenticated/admin/add")({
  staticData: {
    breadcrumbs: [
      { label: "\u7ba1\u7406\u5458", href: "/admin" },
      { label: "\u65b0\u5efa\u7ba1\u7406\u5458" },
    ],
  },
  component: AdminAddPage,
})
