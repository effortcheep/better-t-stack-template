import { UsersIcon } from "lucide-react"
import { USER_PERMISSIONS } from "@/lib/permissions"

export const nav = {
  title: "用户管理",
  url: "/users",
  icon: <UsersIcon />,
  permissions: [USER_PERMISSIONS.read],
}
