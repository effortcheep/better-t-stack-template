import { createFileRoute } from "@tanstack/react-router"
import { USER_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"

import UserAddPage from "@/features/users/pages/add"

export const Route = createFileRoute("/_authenticated/users/add")({
  beforeLoad: () => {
    requirePermission(USER_PERMISSIONS.create)
  },
  staticData: {
    breadcrumbs: [
      { label: "用户管理", href: "/users" },
      { label: "新建用户" },
    ],
  },
  component: UserAddPage,
})
