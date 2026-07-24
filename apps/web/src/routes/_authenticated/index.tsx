import { createFileRoute } from "@tanstack/react-router"

import IndexPage from "@/features/home/pages"

export const Route = createFileRoute("/_authenticated/")({
  staticData: { breadcrumbs: [{ label: "首页" }] },
  component: IndexPage,
})
