import { LayersIcon } from "lucide-react"
import { TEMPLATE_PERMISSIONS } from "@/lib/permissions"

export const nav = {
  title: "模板管理",
  url: "/template",
  icon: <LayersIcon />,
  permissions: [TEMPLATE_PERMISSIONS.read],
}
