import { type ReactNode } from "react"
import { type Table } from "@tanstack/react-table"
import { XIcon } from "lucide-react"

import { Badge } from "@better-t-stack-template/ui/components/badge"
import { Button } from "@better-t-stack-template/ui/components/button"
import { Separator } from "@better-t-stack-template/ui/components/separator"
import { cn } from "@better-t-stack-template/ui/lib/utils"

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  entityName: string
  children: ReactNode
}

/**
 * 行被选中时浮出的批量操作工具条。
 * 通过 children 注入具体的操作按钮（如「删除」）。
 */
export function DataTableBulkActions<TData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  if (selectedCount === 0) return null

  return (
    <div
      role="toolbar"
      aria-label={`已选择 ${selectedCount} 项${entityName}`}
      className={cn(
        "fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur",
      )}
    >
      <Button
        variant="outline"
        size="icon-xs"
        className="size-7 rounded-full"
        onClick={() => table.resetRowSelection()}
        aria-label="清除选择"
        title="清除选择"
      >
        <XIcon className="size-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-1.5 pr-1 text-sm">
        <Badge variant="default" className="rounded-md">
          {selectedCount}
        </Badge>
        <span className="text-muted-foreground">已选</span>
      </div>
      <Separator orientation="vertical" className="h-5" />
      {children}
    </div>
  )
}
