import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/route-guard"
import { PROJECT_PERMISSIONS } from "@/lib/permissions"

import ProjectListPage from "@/features/projects/pages"

export const Route = createFileRoute("/_authenticated/projects/")({
  beforeLoad: () => {
    requirePermission(PROJECT_PERMISSIONS.read)
  },
  staticData: {
    breadcrumbs: [
      { label: "项目管理", href: "/projects" },
      { label: "项目列表" },
    ],
  },
  component: ProjectListPage,
})
