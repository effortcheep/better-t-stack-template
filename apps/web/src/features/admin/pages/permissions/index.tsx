import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@better-t-stack-template/ui/components/table"

import { usePermissionList } from "@/features/admin/role-api"

export default function PermissionListPage() {
  const { data: modules, isLoading } = usePermissionList()

  const moduleList = modules ?? []

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            权限码管理
          </h1>
          <p className="text-sm text-muted-foreground">
            由各模块 permission.json 定义，只读
          </p>
        </div>
      </div>

      {moduleList.map((mod) => (
        <div key={mod.module} className="space-y-2">
          <h2 className="text-base font-semibold">{mod.module}</h2>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>权限码</TableHead>
                  <TableHead>说明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell className="h-12">
                        <div className="h-3.5 w-full animate-pulse rounded-sm bg-muted" />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : mod.permissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-12 text-center text-muted-foreground"
                    >
                      此模块暂无权限码
                    </TableCell>
                  </TableRow>
                ) : (
                  mod.permissions.map((perm) => (
                    <TableRow key={perm.code}>
                      <TableCell>
                        <code className="text-sm font-mono">{perm.code}</code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {perm.description || "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  )
}