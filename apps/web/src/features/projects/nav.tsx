import { FolderKanbanIcon } from "lucide-react"
import { PROJECT_PERMISSIONS } from "@/lib/permissions"

export const nav = {
  title: "项目管理",
  url: "/projects",
  icon: <FolderKanbanIcon />,
  permissions: [PROJECT_PERMISSIONS.read],
}
