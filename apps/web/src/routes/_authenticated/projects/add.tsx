import { createFileRoute } from "@tanstack/react-router"

import ProjectAddPage from "@/features/projects/pages/add"

export const Route = createFileRoute("/_authenticated/projects/add")({
  staticData: {
    breadcrumbs: [
      { label: "项目管理", href: "/projects" },
      { label: "新建项目" },
    ],
  },
  component: ProjectAddPage,
})