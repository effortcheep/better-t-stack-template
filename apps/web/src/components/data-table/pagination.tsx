import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@better-t-stack-template/ui/components/select"
import { cn } from "@better-t-stack-template/ui/lib/utils"
import { type Table } from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

/** 计算折叠后的页码序列（1-indexed，用 "…" 表示省略） */
function getPageNumbers(
  current: number,
  total: number,
): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const out: (number | "…")[] = [1]
  if (current > 3) out.push("…")
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) out.push(i)
  if (current < total - 2) out.push("…")
  out.push(total)
  return out
}

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
}

export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const currentPage =
    table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pages = getPageNumbers(currentPage, totalPages)

  const selectedCount =
    table.getFilteredSelectedRowModel().rows.length

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        共{" "}
        <span className="font-medium text-foreground tabular-nums">
          {table.getFilteredRowModel().rows.length}
        </span>{" "}
        条
        {selectedCount > 0 && (
          <>
            {" · 已选 "}
            <span className="font-medium text-foreground tabular-nums">
              {selectedCount}
            </span>
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 sm:flex">
          <span className="text-sm text-muted-foreground">
            每页
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) =>
              table.setPageSize(Number(value))
            }
          >
            <SelectTrigger className="h-8 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 20, 30].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            aria-label="首页"
          >
            <ChevronsLeftIcon className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            aria-label="上一页"
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>

          {pages.map((page, i) =>
            page === "…" ? (
              <span
                key={`e-${i}`}
                className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={
                  page === currentPage
                    ? "default"
                    : "outline"
                }
                className="h-8 w-8 p-0 text-xs"
                onClick={() => table.setPageIndex(page - 1)}
                aria-label={`第 ${page} 页`}
                aria-current={
                  page === currentPage ? "page" : undefined
                }
              >
                {page}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            aria-label="下一页"
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={!table.getCanNextPage()}
            onClick={() =>
              table.setPageIndex(table.getPageCount() - 1)
            }
            aria-label="末页"
          >
            <ChevronsRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
