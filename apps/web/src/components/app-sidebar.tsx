import { useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@better-t-stack-template/ui/components/sidebar"
import {
  AudioLinesIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  MapIcon,
  PieChartIcon,
  TerminalIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { nav as adminNav, rolesNav, permissionsNav } from "@/features/admin/nav"
import { nav as dashboardNav } from "@/features/dashboard/nav"
import { nav as homeNav } from "@/features/home/nav"
import { nav as projectsNav } from "@/features/projects/nav"
import { nav as tasksNav } from "@/features/tasks/nav"
import { nav as templateNav } from "@/features/template/nav"
import { nav as usersNav } from "@/features/users/nav"

import { logout } from "@/lib/auth"
import { useAuth } from "@/stores/auth"
import { usePermissions } from "@/stores/permissions"
import { useNavigate } from "@tanstack/react-router"

/** 导航项类型 — 各 feature/nav.tsx 导出的公共契约 */
export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  permissions?: string[]
}

/** 聚合各 feature 的导航项。
 *  如需多个 feature 合并到同一分组，在此手动组合。 */
const navMain: NavItem[] = [
  homeNav,
  dashboardNav,
  templateNav,
  tasksNav,
  projectsNav,
  usersNav,
  adminNav,
  rolesNav,
  permissionsNav,
]

/** 团队切换占位 — 后续由 stores/ 或 features/team/ 提供。 */
const placeholderTeams = [
  {
    name: "Acme Inc",
    logo: <GalleryVerticalEndIcon />,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: <AudioLinesIcon />,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: <TerminalIcon />,
    plan: "Free",
  },
]

/** 项目快捷方式占位 — 后续由 features/projects/ 提供真实数据。 */
const placeholderProjects = [
  {
    name: "Design Engineering",
    url: "#",
    icon: <FrameIcon />,
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: <PieChartIcon />,
  },
  {
    name: "Travel",
    url: "#",
    icon: <MapIcon />,
  },
]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoaded, fetch, has } = usePermissions()

  /* 登录后自取一次权限 */
  useEffect(() => {
    if (!isLoaded) {
      fetch()
    }
  }, [isLoaded, fetch])

  /* 按权限过滤导航项：无 permissions 声明 → 公开；有声明 → OR 匹配 */
  const visibleNav = navMain.filter((item) => {
    if (!item.permissions || item.permissions.length === 0) return true
    return item.permissions.some((p) => has(p))
  })

  const handleLogout = async () => {
    await logout()
    navigate({ to: "/login", replace: true })
  }

  const navUser = user
    ? { name: String(user.name ?? ""), email: String(user.email ?? ""), avatar: String(user.image ?? "") }
    : { name: "", email: "", avatar: "" }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={placeholderTeams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNav} />
        <NavProjects projects={placeholderProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}