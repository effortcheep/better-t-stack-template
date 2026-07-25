import { Button } from "@better-t-stack-template/ui/components/button"
import { Checkbox } from "@better-t-stack-template/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@better-t-stack-template/ui/components/dropdown-menu"
import { Switch } from "@better-t-stack-template/ui/components/switch"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  ViewIcon,
} from "lucide-react"
import * as React from "react"

import { DataTableColumnHeader } from "@/components/data-table"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import type { TaskRecord } from "@/features/tasks/types"

const columnHelper = createColumnHelper<TaskRecord>()

export function taskColumns(
  onDelete: (id: number) => void,
) {
  return [
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

    columnHelper.accessor("id", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" />
      ),
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {getValue()}
        </span>
      ),
      meta: { className: "w-16" },
      enableSorting: false,
    }),

    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="名称" />
      ),
      cell: ({ getValue, row }) => (
        <Link
          to="/tasks/$taskId"
          params={{ taskId: String(row.original.id) }}
          className="font-medium hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),

    columnHelper.accessor("done", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="状态" />
      ),
      cell: ({ getValue }) => (
        <Switch
          checked={getValue()}
          aria-readonly
          className="pointer-events-none"
        />
      ),
      meta: { className: "w-24" },
    }),

    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
      cell: ({ getValue }) => {
        const d = getValue()
        return (
          <span className="text-sm text-muted-foreground">
            {d.toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      },
      meta: { className: "w-44" },
      sortingFn: "datetime",
    }),

    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const [showDeleteDialog, setShowDeleteDialog] =
          React.useState(false)

        return (
          <>
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
                        to="/tasks/$taskId"
                        params={{
                          taskId: String(row.original.id),
                        }}
                      >
                        <ViewIcon data-icon="inline-start" />
                        查看
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/tasks/$taskId/update"
                        params={{
                          taskId: String(row.original.id),
                        }}
                      >
                        <PencilIcon data-icon="inline-start" />
                        编辑
                      </Link>
                    }
                  />
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2Icon
                      data-icon="inline-start"
                      className="text-destructive"
                    />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDeleteDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={() => {
                onDelete(row.original.id)
              }}
              description={`确定要删除「${row.original.name}」吗？此操作不可撤销。`}
            />
          </>
        )
      },
      meta: { className: "w-12" },
      enableSorting: false,
      enableHiding: false,
    }),
  ]
}