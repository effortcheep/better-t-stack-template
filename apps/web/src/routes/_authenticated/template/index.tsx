import { createFileRoute } from "@tanstack/react-router"
import { TEMPLATE_PERMISSIONS } from "@/lib/permissions"
import { requirePermission } from "@/lib/route-guard"
import { z } from "zod"

import TemplateListPage from "@/features/template/pages"

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
  beforeLoad: () => {
    requirePermission(TEMPLATE_PERMISSIONS.read)
  },
  validateSearch: searchSchema,
  staticData: { breadcrumbs: [{ label: "模板管理", href: "/template" }, { label: "模板列表" }] },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <TemplateListPage search={search} navigate={navigate} />
  )
}
