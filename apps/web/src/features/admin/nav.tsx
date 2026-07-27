import {
  KeyIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react"

export const nav = {
  title: "管理员",
  url: "/admin",
  icon: <ShieldIcon />,
  permissions: ["users:assign"],
}

export const rolesNav = {
  title: "角色管理",
  url: "/admin/roles",
  icon: <UsersIcon />,
  permissions: ["roles:read", "roles:manage"],
}

export const permissionsNav = {
  title: "权限码管理",
  url: "/admin/permissions",
  icon: <KeyIcon />,
  permissions: ["roles:read", "roles:manage"],
}