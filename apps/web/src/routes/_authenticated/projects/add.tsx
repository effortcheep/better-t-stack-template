import { createFileRoute } from "@tanstack/react-router"

import ProjectAddPage from "@/features/projects/pages/add"

export const Route = createFileRoute("/_authenticated/projects/add")({
  component: ProjectAddPage,
})