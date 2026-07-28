import { CheckSquareIcon } from "lucide-react"
import { TASK_PERMISSIONS } from "@/lib/permissions"

export const nav = {
  title: "任务管理",
  url: "/tasks",
  icon: <CheckSquareIcon />,
  permissions: [TASK_PERMISSIONS.read],
}