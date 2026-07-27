import { Badge } from "@better-t-stack-template/ui/components/badge"
import { Button } from "@better-t-stack-template/ui/components/button"
import { Checkbox } from "@better-t-stack-template/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@better-t-stack-template/ui/components/dropdown-menu"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontalIcon,
  PencilIcon,
  ViewIcon,
} from "lucide-react"

import { type UserListItem } from "@/features/admin/types"

const columnHelper = createColumnHelper<UserListItem>()

export const userColumns = [
  // ====== 选择列 ======
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(!!checked)
        }
        aria-label="全选"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) =>
          row.toggleSelected(!!checked)
        }
        aria-label="选择行"
      />
    ),
    meta: { className: "w-12" },
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("name", {
    header: "名称",
    cell: ({ getValue, row }) => (
      <Link
        to="/admin/$adminId"
        params={{ adminId: row.original.id }}
        className="font-medium hover:underline"
      >
        {getValue()}
      </Link>
    ),
    enableSorting: false,
  }),
  columnHelper.accessor("email", {
    header: "邮箱",
    enableSorting: false,
  }),
  columnHelper.accessor("username", {
    header: "用户名",
    cell: ({ getValue }) => getValue() ?? "—",
    enableSorting: false,
  }),
  columnHelper.accessor("emailVerified", {
    header: "验证状态",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="default">已验证</Badge>
      ) : (
        <Badge variant="secondary">未验证</Badge>
      ),
    enableSorting: false,
  }),
  columnHelper.accessor("roles", {
    header: "角色",
    cell: ({ getValue }) => {
      const roles = getValue()
      if (roles.length === 0) {
        return (
          <span className="text-sm text-muted-foreground">—</span>
        )
      }
      const shown = roles.slice(0, 3)
      const overflow = roles.length - 3
      return (
        <div className="flex flex-wrap items-center gap-1">
          {shown.map((role) => (
            <Badge
              key={role.id}
              variant="outline"
              className="text-xs"
            >
              {role.name}
            </Badge>
          ))}
          {overflow > 0 && (
            <Badge
              variant="secondary"
              className="text-xs"
              title={roles.slice(3).map((r) => r.name).join(", ")}
            >
              +{overflow}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  }),
  columnHelper.accessor("createdAt", {
    header: "创建时间",
    cell: ({ getValue }) =>
      format(new Date(getValue()), "yyyy-MM-dd HH:mm"),
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={true}
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">操作</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    to="/admin/$adminId"
                    params={{ adminId: item.id }}
                  >
                    <ViewIcon data-icon="inline-start" />
                    查看详情
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link
                    to="/admin/$adminId/update"
                    params={{ adminId: item.id }}
                  >
                    <PencilIcon data-icon="inline-start" />
                    修改密码
                  </Link>
                }
              />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    meta: { className: "w-12" },
    enableSorting: false,
    enableHiding: false,
  }),
]