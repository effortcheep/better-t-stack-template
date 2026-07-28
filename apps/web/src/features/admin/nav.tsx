import {
  KeyIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react"
import { ROLE_PERMISSIONS, USER_PERMISSIONS } from "@/lib/permissions"

export const nav = {
  title: "管理员",
  url: "/admin",
  icon: <ShieldIcon />,
  permissions: [USER_PERMISSIONS.read],
}

export const rolesNav = {
  title: "角色管理",
  url: "/admin/roles",
  icon: <UsersIcon />,
  permissions: [ROLE_PERMISSIONS.read, ROLE_PERMISSIONS.manage],
}

export const permissionsNav = {
  title: "权限码管理",
  url: "/admin/permissions",
  icon: <KeyIcon />,
  permissions: [ROLE_PERMISSIONS.read, ROLE_PERMISSIONS.manage],
}