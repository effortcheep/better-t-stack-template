import { createFileRoute } from "@tanstack/react-router"

import AddTemplatePage from "@/features/template/pages/add-template"

export const Route = createFileRoute(
  "/_authenticated/template/add-template",
)({
  staticData: { breadcrumbs: [{ label: "模板管理", href: "/template" }, { label: "新建模板" }] },
  component: AddTemplatePage,
})
