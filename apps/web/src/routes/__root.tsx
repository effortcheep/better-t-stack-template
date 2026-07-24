import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@better-t-stack-template/ui/components/sonner"
import { TooltipProvider } from "@better-t-stack-template/ui/components/tooltip"
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Button } from "@better-t-stack-template/ui/components/button"
import { useNavigate } from "@tanstack/react-router"

import { ThemeProvider } from "@/components/theme-provider"
import { AppError } from "@/lib/errors"
import { ErrorPage } from "@/features/error/pages/error"

import "../index.css"

const queryClient = new QueryClient()

export interface RouterAppContext {}

export const Route =
  createRootRouteWithContext<RouterAppContext>()({
    component: RootComponent,
    notFoundComponent: NotFound,
    errorComponent: ErrorComponent,
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

function NotFound() {
  return <ErrorPage code={404} />
}

function ErrorComponent({
  error,
}: {
  error: unknown
}) {
  const navigate = useNavigate()

  if (error instanceof AppError) {
    return (
      <ErrorPage
        code={error.status}
        title={error.message}
        description={error.description}
        actions={
          error.status === 401 ? (
            <>
              <Button
                onClick={() =>
                  navigate({ to: "/login" })
                }
              >
                去登录
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.history.go(-1)
                }
              >
                返回上页
              </Button>
            </>
          ) : undefined
        }
      />
    )
  }

  return <ErrorPage code={500} />
}