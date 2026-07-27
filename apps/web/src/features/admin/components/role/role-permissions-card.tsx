"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@better-t-stack-template/ui/components/combobox"
import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@better-t-stack-template/ui/components/card"
import { Separator } from "@better-t-stack-template/ui/components/separator"
import { XIcon } from "lucide-react"
import { useMemo, useState } from "react"

import {
  useAddRolePermission,
  usePermissionList,
  useRemoveRolePermission,
  useRolePermissions,
} from "@/features/admin/role-api"

interface RolePermissionsCardProps {
  roleId: string
}

export function RolePermissionsCard({ roleId }: RolePermissionsCardProps) {
  const { data: permissions, isLoading } = useRolePermissions(roleId)
  const { data: modules } = usePermissionList()
  const addMutation = useAddRolePermission()
  const removeMutation = useRemoveRolePermission()

  const [newPermission, setNewPermission] = useState("")

  const items = permissions ?? []
  const moduleList = modules ?? []

  const codeDescriptionMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const mod of moduleList) {
      for (const p of mod.permissions) {
        map.set(p.code, p.description || "")
      }
    }
    return map
  }, [moduleList])

  function handleAdd() {
    const trimmed = newPermission.trim()
    if (!trimmed) return
    addMutation.mutate(
      { roleId, permission: trimmed },
      { onSuccess: () => setNewPermission("") },
    )
  }

  function handleRemove(permission: string) {
    removeMutation.mutate({ roleId, permission })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">权限</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : (
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">暂无权限</p>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <code className="text-sm font-mono">{item.permission}</code>
                  {codeDescriptionMap.get(item.permission) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {codeDescriptionMap.get(item.permission)}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={removeMutation.isPending}
                  onClick={() => handleRemove(item.permission)}
                  aria-label={`移除权限 ${item.permission}`}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          <Combobox
            value={newPermission}
            onValueChange={(value) => setNewPermission(value ?? "")}
            inputValue={newPermission}
            onInputValueChange={(value) => setNewPermission(value)}
          >
            <ComboboxInput
              placeholder="选择或输入权限码"
              className="flex-1"
            />
            <ComboboxContent>
              <ComboboxList>
                {moduleList.map((mod, idx) => (
                  <ComboboxGroup key={mod.module}>
                    {idx > 0 && <ComboboxSeparator />}
                    <ComboboxLabel>{mod.module}</ComboboxLabel>
                    {mod.permissions.map((perm) => (
                      <ComboboxItem key={perm.code} value={perm.code}>
                        <div className="flex flex-col">
                          <span className="font-mono text-sm">{perm.code}</span>
                          {perm.description && (
                            <span className="text-xs text-muted-foreground">
                              {perm.description}
                            </span>
                          )}
                        </div>
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                ))}
                <ComboboxEmpty>无匹配权限码</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Button
            type="button"
            variant="outline"
            disabled={!newPermission.trim() || addMutation.isPending}
            onClick={handleAdd}
          >
            {addMutation.isPending ? "添加中…" : "添加"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}