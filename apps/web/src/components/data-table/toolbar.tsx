import { Button } from "@better-t-stack-template/ui/components/button"
import { Input } from "@better-t-stack-template/ui/components/input"
import { type Table } from "@tanstack/react-table"
import { SearchIcon, XIcon } from "lucide-react"
import * as React from "react"
import { type ComponentType } from "react"

import { DataTableFacetedFilter } from "./faceted-filter"
import { DataTableViewOptions } from "./view-options"

type FacetedFilterConfig = {
  columnId: string
  title: string
  options: {
    label: string
    value: string
    icon?: ComponentType<{ className?: string }>
  }[]
  /** 是否支持多选，默认 false */
  multiple?: boolean
}

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: FacetedFilterConfig[]
  columnLabels?: Record<string, string>
  searchDebounceMs?: number
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "搜索…",
  searchKey,
  filters = [],
  columnLabels,
  searchDebounceMs = 300,
}: DataTableToolbarProps<TData>) {
  const column = searchKey
    ? table.getColumn(searchKey)
    : undefined
  const [searchValue, setSearchValue] =
    React.useState<string>(
      (column?.getFilterValue() as string) ?? "",
    )
  const timerRef = React.useRef(0)

  // 外部（重置 / URL 回写）改变筛选值时，同步到搜索输入框
  React.useEffect(() => {
    const value = (column?.getFilterValue() as string) ?? ""
    setSearchValue(value)
  }, [column, column?.getFilterValue()])

  function handleSearchChange(next: string) {
    setSearchValue(next)
    clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      column?.setFilterValue(next || undefined)
    }, searchDebounceMs)
  }

  const isFiltered =
    table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchKey && (
          <div className="relative w-full sm:w-64">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchValue}
              onChange={(e) =>
                handleSearchChange(e.target.value)
              }
              placeholder={searchPlaceholder}
              className="h-8 pl-8"
              aria-label={searchPlaceholder}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const col = table.getColumn(filter.columnId)
            if (!col) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={col}
                title={filter.title}
                options={filter.options}
                multiple={filter.multiple}
              />
            )
          })}
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => table.resetColumnFilters()}
          >
            重置
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions
        table={table}
        columnLabels={columnLabels}
      />
    </div>
  )
}
