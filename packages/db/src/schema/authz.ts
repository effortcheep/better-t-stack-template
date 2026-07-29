import { relations } from "drizzle-orm"
import { createSelectSchema } from "drizzle-zod"
import { pgTable, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core"

import { user } from "./auth"

/** 角色定义。权限码通过 role_permissions 表关联，不在此存。 */
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/** 角色所持权限码。permission 列存 "resource:action" 格式字符串。 */
export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
  },
  (table) => [
    uniqueIndex("rp_role_permission_idx").on(table.roleId, table.permission),
    index("rp_role_id_idx").on(table.roleId),
  ],
)

/** 用户-角色多对多关联。 */
export const userRoles = pgTable(
  "user_roles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("ur_user_role_idx").on(table.userId, table.roleId),
    index("ur_user_id_idx").on(table.userId),
    index("ur_role_id_idx").on(table.roleId),
  ],
)

/* ---- 关系 ---- */

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  userRoles: many(userRoles),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}))

/* ---- Zod select schema ---- */

export const selectRoleSchema = createSelectSchema(roles)
export const selectRolePermissionSchema = createSelectSchema(rolePermissions)
export const selectUserRoleSchema = createSelectSchema(userRoles)