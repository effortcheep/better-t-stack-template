import { createFileRoute } from "@tanstack/react-router"

import UserAddPage from "@/features/users/pages/add"

export const Route = createFileRoute("/_authenticated/users/add")({
  staticData: {
    breadcrumbs: [
      { label: "用户管理", href: "/users" },
      { label: "新建用户" },
    ],
  },
  component: UserAddPage,
})
