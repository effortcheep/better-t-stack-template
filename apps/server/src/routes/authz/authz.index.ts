import { hasPermission } from "~/lib/permissions"
import {
  createPermissionGuard,
  crudPermissionRules,
  type PermissionRule,
} from "~/middlewares/permission-guard"

import { createRouter } from "~/lib/create-app"
import * as handlers from "./authz.handler"
import * as routes from "./authz.routes"

const authzRules: PermissionRule[] = [
  ...crudPermissionRules("roles", "roles"),
  {
    methods: ["GET"],
    path: /\/roles\/[^/]+\/permissions\/?$/,
    permission: "roles:read",
  },
  {
    methods: ["POST"],
    path: /\/roles\/[^/]+\/permissions\/?$/,
    permission: "roles:update",
  },
  {
    methods: ["DELETE"],
    path: /\/roles\/[^/]+\/permissions\/[^/]+/,
    permission: "roles:update",
  },
  {
    methods: ["GET"],
    path: /\/permissions\/?$/,
    permission: "roles:read",
  },
]

const authzGuard = createPermissionGuard(authzRules, {
  satisfies: (permissions, target) =>
    hasPermission(permissions, target) || permissions.has("roles:manage"),
})

const router = createRouter()
router.use("*", authzGuard)

export default router
  .openapi(routes.listRoles, handlers.listRoles)
  .openapi(routes.createRole, handlers.createRole)
  .openapi(routes.getRole, handlers.getRole)
  .openapi(routes.updateRole, handlers.updateRole)
  .openapi(routes.deleteRole, handlers.deleteRole)
  .openapi(routes.listRolePermissions, handlers.listRolePermissions)
  .openapi(routes.addRolePermission, handlers.addRolePermission)
  .openapi(routes.removeRolePermission, handlers.removeRolePermission)
  .openapi(routes.listAllPermissions, handlers.listAllPermissions)
