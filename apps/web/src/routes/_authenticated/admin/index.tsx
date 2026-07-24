import { createFileRoute } from "@tanstack/react-router"

import AdminListPage from "@/features/admin/pages"

export const Route = createFileRoute("/_authenticated/admin/")({
  staticData: {
    breadcrumbs: [
      { label: "\u7ba1\u7406\u5458", href: "/admin" },
      { label: "\u7ba1\u7406\u5458\u5217\u8868" },
    ],
  },
  component: AdminListPage,
})