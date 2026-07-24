import { Button } from "@better-t-stack-template/ui/components/button"
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
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PlusIcon, Trash2Icon } from "lucide-react"
import * as React from "react"

import {
  DataTableBulkActions,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table"
import {
  useDeleteTemplate,
  useTemplateList,
} from "@/lib/api"
import { templateColumns } from "./components/template-columns"
import { ConfirmDeleteDialog } from "./components/confirm-delete-dialog"
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/template-types"

/** 模板列表页的搜索参数形状，与 route 文件中的 searchSchema 保持一致 */
export interface TemplateListSearch {
  search: string
  status: string[]
  priority: string
  page: number
  pageSize: number
}

export interface TemplateListPageProps {
  search: TemplateListSearch
  navigate: (opts: {
    search: (
      prev: TemplateListSearch,
    ) => Partial<TemplateListSearch>
    replace?: boolean
  }) => void
}

export default function TemplateListPage({
  search: urlSearch,
  navigate,
}: TemplateListPageProps) {
  // --- URL → TanStack Table 状态映射 ---

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: urlSearch.page - 1,
      pageSize: urlSearch.pageSize,
    }),
    [urlSearch.page, urlSearch.pageSize],
  )

  const columnFilters: ColumnFiltersState =
    React.useMemo(() => {
      const result: ColumnFiltersState = []
      if (urlSearch.search) {
        result.push({
          id: "title",
          value: urlSearch.search,
        })
      }
      if (urlSearch.status.length > 0) {
        result.push({
          id: "status",
          value: urlSearch.status,
        })
      }
      if (urlSearch.priority) {
        result.push({
          id: "priority",
          value: urlSearch.priority,
        })
      }
      return result
    }, [
      urlSearch.search,
      urlSearch.status,
      urlSearch.priority,
    ])

  const [sorting, setSorting] =
    React.useState<SortingState>([])
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] =
    React.useState(false)

  // 取全量数据，交客户端分页 / 筛选 / 排序
  const { data, isLoading } = useTemplateList({
    page: 1,
    pageSize: 999,
  })

  const deleteMutation = useDeleteTemplate()

  const handleDelete = React.useCallback(
    (id: number) => deleteMutation.mutate(id),
    [deleteMutation],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns: React.useMemo(
      () => templateColumns(handleDelete),
      [handleDelete],
    ),
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(pagination)
          : updater
      navigate({
        search: (prev) => ({
          ...prev,
          page: next.pageIndex + 1,
          pageSize: next.pageSize,
        }),
        replace: true,
      })
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(columnFilters)
          : updater
      const titleF =
        next.find((f) => f.id === "title")?.value ?? ""
      const statusF =
        (next.find((f) => f.id === "status")?.value as
          | string[]
          | undefined) ?? []
      const priorityF =
        (next.find((f) => f.id === "priority")?.value as
          | string
          | undefined) ?? ""
      navigate({
        search: (prev) => ({
          ...prev,
          search: String(titleF),
          status: statusF,
          priority: priorityF,
          page: 1, // 筛选变动回第一页
        }),
        replace: true,
      })
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
            模板列表
          </h1>
          <p className="text-sm text-muted-foreground">
            管理所有模板数据
          </p>
        </div>
        <Button
          render={<Link to="/template/add-template" />}
        >
          <PlusIcon data-icon="inline-start" />
          新建模板
        </Button>
      </div>

      {/* 工具条：搜索 + 分面筛选 + 显示列 + 重置 */}
      <DataTableToolbar
        table={table}
        searchPlaceholder="搜索标题…"
        searchKey="title"
        filters={[
          {
            columnId: "status",
            title: "状态",
            multiple: true,
            options: STATUS_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            })),
          },
          {
            columnId: "priority",
            title: "优先级",
            options: PRIORITY_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            })),
          },
        ]}
        columnLabels={{
          id: "#",
          title: "标题",
          status: "状态",
          priority: "优先级",
          tags: "标签",
          published: "已发布",
        }}
      />

      {/* 表格容器 — rounded-md border 模式 */}
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
            {isLoading ? (
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
                  无匹配记录
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

      <DataTableBulkActions table={table} entityName="模板">
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