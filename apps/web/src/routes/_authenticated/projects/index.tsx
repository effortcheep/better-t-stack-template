import { createFileRoute } from "@tanstack/react-router"

import ProjectListPage from "@/features/projects/pages"

export const Route = createFileRoute("/_authenticated/projects/")({
  staticData: {
    breadcrumbs: [
      { label: "项目管理", href: "/projects" },
      { label: "项目列表" },
    ],
  },
  component: ProjectListPage,
})