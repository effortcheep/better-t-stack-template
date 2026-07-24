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
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  ViewIcon,
} from "lucide-react"
import * as React from "react"

import { DataTableColumnHeader } from "@/components/data-table"
import {
  PriorityBadge,
  ReviewStatusBadge,
  StatusBadge,
  TagBadge,
} from "@/features/template/components/template-badges"
import { type TemplateRecord } from "@/features/template/types"

import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

const columnHelper = createColumnHelper<TemplateRecord>()

export function templateColumns(
  onDelete: (id: number) => void,
) {
  return [
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
    }),
    columnHelper.accessor("title", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="标题" />
      ),
      cell: ({ getValue, row }) => (
        <Link
          to="/template/$templateId"
          params={{ templateId: String(row.original.id) }}
          className="font-medium hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="状态" />
      ),
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor("priority", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="优先级" />
      ),
      cell: ({ getValue }) => (
        <PriorityBadge priority={getValue()} />
      ),
      filterFn: "equalsString",
    }),
    columnHelper.accessor("reviewStatus", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="审核" />
      ),
      cell: ({ getValue }) => (
        <ReviewStatusBadge reviewStatus={getValue()} />
      ),
    }),
    columnHelper.accessor("tags", {
      header: "标签",
      cell: ({ getValue }) => {
        const tags = getValue()
        if (!tags.length) {
          return (
            <span className="text-xs text-muted-foreground">
              —
            </span>
          )
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag: string) => (
              <TagBadge key={tag} value={tag} />
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
    }),
    columnHelper.accessor("published", {
      header: "已发布",
      cell: ({ getValue }) => {
        const published = getValue()
        return published ? (
          <Badge variant="outline">是</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            —
          </span>
        )
      },
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const [showDeleteDialog, setShowDeleteDialog] =
          React.useState(false)

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">操作</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/template/$templateId"
                      params={{
                        templateId: String(
                          row.original.id,
                        ),
                      }}
                    >
                      <ViewIcon data-icon="inline-start" />
                      查看
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/template/$templateId/update"
                      params={{
                        templateId: String(
                          row.original.id,
                        ),
                      }}
                    >
                      <PencilIcon data-icon="inline-start" />
                      编辑
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
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
              onConfirm={() => onDelete(row.original.id)}
              description={`确定要删除「${row.original.title}」吗？此操作不可撤销。`}
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