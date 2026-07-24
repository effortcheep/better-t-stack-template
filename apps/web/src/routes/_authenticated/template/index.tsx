import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import TemplateListPage from "@/pages/_authenticated/template"

const searchSchema = z.object({
  search: z.string().default(""),
  status: z.array(z.string()).default([]),
  priority: z.string().default(""),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
})

export const Route = createFileRoute(
  "/_authenticated/template/",
)({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return <TemplateListPage search={search} navigate={navigate} />
}
