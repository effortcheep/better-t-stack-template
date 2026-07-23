import { type Table } from "@tanstack/react-table"
import { SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@better-t-stack-template/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@better-t-stack-template/ui/components/dropdown-menu"

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
  columnLabels?: Record<string, string>
}

export function DataTableViewOptions<TData>({
  table,
  columnLabels,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={false}
        render={
          <Button variant="outline" size="sm" className="h-8 hidden lg:flex">
          </Button>
        }
      >
        <SlidersHorizontalIcon className="size-4" />
        显示列
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>显示列</DropdownMenuLabel>
          <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {columnLabels?.[column.id] ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
