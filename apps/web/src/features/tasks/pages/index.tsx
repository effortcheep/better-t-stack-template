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
import type { NavigateOptions } from "@tanstack/react-router"
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
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PlusIcon } from "lucide-react"
import * as React from "react"

import { DataTablePagination, DataTableToolbar } from "@/components/data-table"
import { useDeleteTask, useTaskList } from "@/features/tasks/api"
import { taskColumns } from "@/features/tasks/components/columns"

/** 任务列表页的搜索参数形状，与 route 文件中的 searchSchema 保持一致 */
export interface TaskListSearch {
  search?: string
  page?: number
  pageSize?: number
  sort?: "createdAt" | "updatedAt"
  order?: "asc" | "desc"
}

export interface TaskListPageProps {
  search: TaskListSearch
  navigate: (opts: NavigateOptions) => void
}

export default function TaskListPage({
  search: urlSearch,
  navigate,
}: TaskListPageProps) {
  // --- URL → TanStack Table 状态映射 ---

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: (urlSearch.page ?? 1) - 1,
      pageSize: urlSearch.pageSize ?? 10,
    }),
    [urlSearch.page, urlSearch.pageSize],
  )

  const sorting: SortingState = React.useMemo(() => {
    const col = urlSearch.sort ?? "createdAt"
    const desc = (urlSearch.order ?? "desc") === "desc"
    return [{ id: col, desc }]
  }, [urlSearch.sort, urlSearch.order])

  const columnFilters: ColumnFiltersState = React.useMemo(() => {
    const result: ColumnFiltersState = []
    if (urlSearch.search) {
      result.push({ id: "name", value: urlSearch.search })
    }
    return result
  }, [urlSearch.search])

  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  // 服务端分页 / 排序 / 筛选
  const { data, isLoading } = useTaskList({
    search: urlSearch.search ?? "",
    page: urlSearch.page ?? 1,
    pageSize: urlSearch.pageSize ?? 10,
    sort: urlSearch.sort ?? "createdAt",
    order: urlSearch.order ?? "desc",
  })

  const deleteMutation = useDeleteTask()

  const handleDelete = React.useCallback(
    (id: number) => deleteMutation.mutate(id),
    [deleteMutation],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns: React.useMemo(
      () => taskColumns(handleDelete),
      [handleDelete],
    ),
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    pageCount: data ? Math.ceil(data.total / data.pageSize) : 1,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
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
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(sorting)
          : updater
      const entry = next[0]
      navigate({
        search: (prev) => ({
          ...prev,
          sort: (entry?.id as "createdAt" | "updatedAt") ?? "createdAt",
          order: entry?.desc ? "desc" : "asc",
          page: 1,
        }),
        replace: true,
      })
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(columnFilters)
          : updater
      const nameFilter =
        (next.find((f) => f.id === "name")?.value as string | undefined) ?? ""
      navigate({
        search: (prev) => ({
          ...prev,
          search: nameFilter,
          page: 1,
        }),
        replace: true,
      })
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* 页头 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">任务列表</h1>
          <p className="text-sm text-muted-foreground">管理所有任务</p>
        </div>
        <Button
          nativeButton={false}
          render={<Link to="/tasks/add" />}
        >
          <PlusIcon data-icon="inline-start" />
          新建任务
        </Button>
      </div>

      {/* 工具条：搜索 + 显示列 */}
      <DataTableToolbar
        table={table}
        searchPlaceholder="搜索名称…"
        searchKey="name"
        columnLabels={{
          id: "#",
          name: "名称",
          done: "状态",
          createdAt: "创建时间",
        }}
      />

      {/* 表格容器 */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                      header.column.columnDef.meta?.className,
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
                length: table.getState().pagination.pageSize,
              }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {table.getAllColumns().map((col, j) => (
                    <TableCell key={`sk-${i}-${j}`} className="h-12">
                      <div className="h-3.5 w-full animate-pulse rounded-sm bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                        cell.column.columnDef.meta?.className,
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

      <DataTablePagination table={table} className="mt-auto" />
    </div>
  )
}