import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"

import AddTemplatePage from "@/features/template/pages/add-template"

export const Route = createFileRoute(
  "/_authenticated/template/add-template",
)({
  beforeLoad: () => {
    requirePermission("tasks:create")
  },
  staticData: { breadcrumbs: [{ label: "模板管理", href: "/template" }, { label: "新建模板" }] },
  component: AddTemplatePage,
})
