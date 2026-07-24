import { createFileRoute } from "@tanstack/react-router"

import AddTemplatePage from "@/features/template/pages/add-template"

export const Route = createFileRoute(
  "/_authenticated/template/add-template",
)({
  component: AddTemplatePage,
})
