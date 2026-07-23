import { type HTMLAttributes } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
} from "lucide-react"
import { type Column } from "@tanstack/react-table"

import { Button } from "@better-t-stack-template/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@better-t-stack-template/ui/components/dropdown-menu"
import { cn } from "@better-t-stack-template/ui/lib/utils"

type DataTableColumnHeaderProps<TData, TValue> = HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-1.5 font-medium data-[state=open]:bg-accent"
            />
          }
        >
          <span>{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="size-3.5" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ChevronsUpDownIcon className="size-3.5 opacity-60" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="size-3.5 text-muted-foreground/70" />
            升序
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="size-3.5 text-muted-foreground/70" />
            降序
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOffIcon className="size-3.5 text-muted-foreground/70" />
                隐藏
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
