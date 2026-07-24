import { createFileRoute } from "@tanstack/react-router"

import UserListPage from "@/features/users/pages"

export const Route = createFileRoute("/_authenticated/users/")({
  staticData: {
    breadcrumbs: [
      { label: "用户管理", href: "/users" },
      { label: "用户列表" },
    ],
  },
  component: UserListPage,
})