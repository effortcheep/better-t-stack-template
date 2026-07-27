import { Button } from "@better-t-stack-template/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@better-t-stack-template/ui/components/dropdown-menu"
import { Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  ViewIcon,
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table"
import type { RoleRecord } from "@/features/admin/role-types"

const columnHelper = createColumnHelper<RoleRecord>()

export const roleColumns: ColumnDef<RoleRecord, unknown>[] = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="角色名称" />
    ),
    cell: ({ row, getValue }) => (
      <Link
        to="/admin/roles/$roleId"
        params={{ roleId: row.original.id }}
        className="font-medium hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("description", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="描述" />
    ),
    cell: ({ getValue }) =>
      getValue() || (
        <span className="text-muted-foreground">—</span>
      ),
    enableSorting: false,
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ getValue }) =>
      format(new Date(getValue()), "yyyy-MM-dd HH:mm"),
  }),
  columnHelper.display({
    id: "actions",
    header: "操作",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="size-8 p-0">
              <MoreHorizontalIcon className="size-4" />
              <span className="sr-only">操作</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem
            render={
              <Link
                to="/admin/roles/$roleId"
                params={{ roleId: row.original.id }}
              >
                <ViewIcon />
                查看详情
              </Link>
            }
          />
          <DropdownMenuItem
            render={
              <Link
                to="/admin/roles/$roleId/update"
                params={{ roleId: row.original.id }}
              >
                <PencilIcon />
                编辑
              </Link>
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.preventDefault()
              // 删除操作由列表页的 onDelete 回调处理
            }}
          >
            <Trash2Icon />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { className: "w-12" },
    enableSorting: false,
  }),
]