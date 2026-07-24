import { createFileRoute } from "@tanstack/react-router"

import ProjectListPage from "@/features/projects/pages"

export const Route = createFileRoute("/_authenticated/projects/")({
  component: ProjectListPage,
})