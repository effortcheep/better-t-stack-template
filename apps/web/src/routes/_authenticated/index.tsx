import { createFileRoute } from "@tanstack/react-router"

import IndexPage from "@/features/home/pages"

export const Route = createFileRoute("/_authenticated/")({
  component: IndexPage,
})
