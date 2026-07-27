import { Button } from "@better-t-stack-template/ui/components/button"
import { Checkbox } from "@better-t-stack-template/ui/components/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@better-t-stack-template/ui/components/table"
import { cn } from "@better-t-stack-template/ui/lib/utils"
import { Link } from "@tanstack/react-router"
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PlusIcon, Trash2Icon } from "lucide-react"
import * as React from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { DataTableBulkActions, DataTablePagination } from "@/components/data-table"
import { useDeleteRole, useRoleList } from "@/features/admin/role-api"
import { roleColumns } from "@/features/admin/components/role/role-columns"
import type { RoleRecord } from "@/features/admin/role-types"

export default function RoleListPage() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({})
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] =
    React.useState(false)

  const roleListQuery = useRoleList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort: (sorting[0]?.id as "createdAt" | "updatedAt") ?? "createdAt",
    order: sorting[0]?.desc ? "desc" : "asc",
  })
  const deleteMutation = useDeleteRole()

  const columns = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }: { table: { getIsAllPageRowsSelected: () => boolean; toggleAllPageRowsSelected: (v: boolean) => void } }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllPageRowsSelected(!!checked)
            }
            aria-label="全选"
          />
        ),
        cell: ({ row }: { row: { getIsSelected: () => boolean; toggleSelected: (v: boolean) => void } }) => (
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
      },
      ...roleColumns,
    ],
    [],
  ) as ColumnDef<RoleRecord, unknown>[]

  const table = useReactTable({
    data: roleListQuery.data?.items ?? [],
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    pageCount: roleListQuery.data
      ? Math.max(
          1,
          Math.ceil(
            roleListQuery.data.total /
              roleListQuery.data.pageSize,
          ),
        )
      : 0,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleBulkDeleteConfirm() {
    const ids = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id)
    ids.forEach((id) => deleteMutation.mutate(id))
    table.resetRowSelection()
  }

  function handleBulkDelete() {
    if (
      table.getFilteredSelectedRowModel().rows.length === 0
    )
      return
    setShowBulkDeleteDialog(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            角色管理
          </h1>
          <p className="text-sm text-muted-foreground">
            管理系统角色
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link to="/admin/roles/add" />}
        >
          <PlusIcon data-icon="inline-start" />
          新建角色
        </Button>
      </div>

      {/* 表格 */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="group/row"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                      header.column.columnDef.meta
                        ?.className,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {roleListQuery.isLoading ? (
              Array.from({
                length:
                  table.getState().pagination.pageSize,
              }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {table.getAllColumns().map((col, j) => (
                    <TableCell
                      key={`sk-${i}-${j}`}
                      className="h-12"
                    >
                      <div className="h-3.5 w-full animate-pulse rounded-sm bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() && "selected"
                  }
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                        cell.column.columnDef.meta
                          ?.className,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无角色
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        className="mt-auto"
      />

      <DataTableBulkActions table={table} entityName="角色">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2Icon data-icon="inline-start" />
          删除
        </Button>
      </DataTableBulkActions>

      <ConfirmDeleteDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        onConfirm={handleBulkDeleteConfirm}
        description={`确定要删除选中的 ${table.getFilteredSelectedRowModel().rows.length} 条记录吗？此操作不可撤销。`}
      />
    </div>
  )
}