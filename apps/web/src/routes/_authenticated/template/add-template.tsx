import { createFileRoute } from "@tanstack/react-router"

import AddTemplatePage from "@/pages/_authenticated/template/add-template"

export const Route = createFileRoute(
  "/_authenticated/template/add-template",
)({
  component: AddTemplatePage,
})
