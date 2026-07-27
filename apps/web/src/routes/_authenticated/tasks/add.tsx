import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import AddTaskPage from "@/features/tasks/pages/add"

export const Route = createFileRoute(
  "/_authenticated/tasks/add",
)({
  beforeLoad: () => {
    requirePermission("tasks:create")
  },
  staticData: { breadcrumbs: [{ label: "任务管理", href: "/tasks" }, { label: "新建任务" }] },
  component: AddTaskPage,
})