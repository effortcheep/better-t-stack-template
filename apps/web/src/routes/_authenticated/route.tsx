"use client"

import { Link, Outlet, createFileRoute, useMatches } from "@tanstack/react-router"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@better-t-stack-template/ui/components/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@better-t-stack-template/ui/components/breadcrumb"
import { Separator } from "@better-t-stack-template/ui/components/separator"
import { AppSidebar } from "@/components/app-sidebar"

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {(() => {
                  const matches = useMatches()
                  const leafMatch = matches[matches.length - 1] as unknown as Record<string, unknown> | undefined
                  const routeBreadcrumbs =
                    (leafMatch?.staticData as { breadcrumbs?: { label: string; href?: string }[] } | undefined)
                      ?.breadcrumbs ?? []
                  const items = [
                    { label: "Better T Stack", href: "/" },
                    ...routeBreadcrumbs,
                  ]
                  return items.map((item, index) => {
                    const isLast = index === items.length - 1
                    return (
                      <>
                        <BreadcrumbItem>
                          {isLast || !item.href ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink render={<Link to={item.href} />}>
                              {item.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                      </>
                    )
                  })
                })()}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}