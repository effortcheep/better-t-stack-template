import { createFileRoute } from "@tanstack/react-router"

import AddTaskPage from "@/features/tasks/pages/add"

export const Route = createFileRoute(
  "/_authenticated/tasks/add",
)({
  staticData: { breadcrumbs: [{ label: "任务管理", href: "/tasks" }, { label: "新建任务" }] },
  component: AddTaskPage,
})