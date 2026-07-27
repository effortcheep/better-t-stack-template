// 角色实体类型定义 — 后端返回的字段子集
// 参考: packages/db/src/schema/authz.ts selectRoleSchema

export type RoleRecord = {
  id: string
  name: string
  description: string
  createdAt: string
}

export type RoleCreateInput = {
  name: string
  description?: string
}

export type RoleUpdateInput = Partial<RoleCreateInput>