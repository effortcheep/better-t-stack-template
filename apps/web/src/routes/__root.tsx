import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@better-t-stack-template/ui/components/sonner"
import { TooltipProvider } from "@better-t-stack-template/ui/components/tooltip"
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { ThemeProvider } from "@/components/theme-provider"

import "../index.css"

const queryClient = new QueryClient()

export interface RouterAppContext {}

export const Route =
  createRootRouteWithContext<RouterAppContext>()({
    component: RootComponent,
    head: () => ({
      meta: [
        {
          title: "better-t-stack-template",
        },
        {
          name: "description",
          content:
            "better-t-stack-template is a web application",
        },
      ],
      links: [
        {
          rel: "icon",
          href: "/favicon.ico",
        },
      ],
    }),
  })

function RootComponent() {
  return (
    <>
      <HeadContent />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          storageKey="vite-ui-theme"
        >
          <TooltipProvider delay={0}>
            <Outlet />
            <Toaster richColors />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  )
}