import { createFileRoute } from "@tanstack/react-router"

import IndexPage from "@/pages/_authenticated"

export const Route = createFileRoute("/_authenticated/")({
  component: IndexPage,
})
