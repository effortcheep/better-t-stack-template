import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@better-t-stack-template/ui/components/sidebar"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { nav as adminNav } from "@/features/admin/nav"
import { nav as dashboardNav } from "@/features/dashboard/nav"
import { nav as homeNav } from "@/features/home/nav"
import { nav as projectsNav } from "@/features/projects/nav"
import { nav as templateNav } from "@/features/template/nav"
import { nav as usersNav } from "@/features/users/nav"
import { FrameIcon, MapIcon, PieChartIcon } from "lucide-react"

/** 聚合各 feature 的导航项。
 *  如需多个 feature 合并到同一分组，在此手动组合。 */
const navMain = [
  homeNav,
  dashboardNav,
  templateNav,
  projectsNav,
  usersNav,
  adminNav,
]

/** 用户信息占位 — 后续由 stores/auth.ts 提供。 */
const placeholderUser = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

/** 项目快捷方式占位 — 后续由 features/projects/ 提供真实数据。 */
const placeholderProjects = [
  { name: "Design Engineering", url: "#", icon: <FrameIcon /> },
  { name: "Sales & Marketing", url: "#", icon: <PieChartIcon /> },
  { name: "Travel", url: "#", icon: <MapIcon /> },
]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={placeholderProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={placeholderUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}