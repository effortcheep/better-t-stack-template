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
} from "@/components/template-badges"
import { type TemplateRecord } from "@/lib/template-types"

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
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="选择全部"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) =>
            row.toggleSelected(!!value)
          }
          aria-label="选择行"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-[40px] pl-3" },
    }),

    columnHelper.accessor("id", {
      header: "#",
      cell: (info) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {info.getValue()}
        </span>
      ),
      meta: { className: "w-[60px] tabular-nums" },
      size: 60,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("title", {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="标题"
        />
      ),
      cell: (info) => (
        <Link
          to="/template/$templateId"
          params={{
            templateId: String(info.row.original.id),
          }}
          className="max-w-60 block truncate font-medium hover:underline underline-offset-4"
        >
          {info.getValue()}
        </Link>
      ),
      meta: { className: "max-w-[240px]" },
      size: 240,
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="状态"
        />
      ),
      cell: (info) => (
        <StatusBadge status={info.getValue()} />
      ),
      meta: { className: "w-[90px]" },
      size: 90,
      filterFn: (row, id, value) =>
        !value ||
        (value as string[]).length === 0 ||
        (value as string[]).includes(row.getValue(id)),
    }),
    columnHelper.accessor("priority", {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="优先级"
        />
      ),
      cell: (info) => (
        <PriorityBadge priority={info.getValue()} />
      ),
      meta: { className: "w-[80px]" },
      size: 80,
      filterFn: (row, id, value) =>
        !value || value === row.getValue(id),
    }),
    columnHelper.accessor("reviewStatus", {
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="审核状态"
        />
      ),
      cell: (info) => (
        <ReviewStatusBadge reviewStatus={info.getValue()} />
      ),
      meta: { className: "w-[90px]" },
      size: 90,
      filterFn: (row, id, value) =>
        !value || value === row.getValue(id),
    }),
    columnHelper.accessor("tags", {
      header: "标签",
      cell: (info) => {
        const tags = info.getValue()
        return tags.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {tags.map((tag) => (
              <TagBadge key={tag} value={tag} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            —
          </span>
        )
      },
      meta: { className: "hidden xl:table-cell" },
      size: 200,
      enableSorting: false,
    }),
    columnHelper.accessor("published", {
      header: "已发布",
      cell: (info) =>
        info.getValue() ? (
          <Badge variant="default">是</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">
            —
          </span>
        ),
      meta: {
        className: "hidden xl:table-cell w-[80px]",
      },
      size: 80,
      enableSorting: false,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">操作</span>,
      cell: (info) => {
        const [showDeleteDialog, setShowDeleteDialog] =
          React.useState(false)
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <Button variant="ghost" size="icon-xs" />
                }
              >
                <MoreHorizontalIcon
                  aria-hidden="true"
                  className="size-3.5"
                />
                <span className="sr-only">操作</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/template/$templateId"
                        params={{
                          templateId: String(
                            info.row.original.id,
                          ),
                        }}
                      />
                    }
                  >
                    <ViewIcon />
                    查看
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/template/$templateId/update"
                        params={{
                          templateId: String(
                            info.row.original.id,
                          ),
                        }}
                      />
                    }
                  >
                    <PencilIcon />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      setShowDeleteDialog(true)
                    }
                  >
                    <Trash2Icon />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDeleteDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={() =>
                onDelete(info.row.original.id)
              }
            />
          </>
        )
      },
      meta: { className: "w-[60px]" },
      size: 60,
      enableSorting: false,
      enableHiding: false,
    }),
  ]
}
