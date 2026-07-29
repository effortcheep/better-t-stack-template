import {
  createPermissionGuard,
  type PermissionRule,
} from "~/middlewares/permission-guard"

import { createRouter } from "~/lib/create-app"

import * as handlers from "./admin.handler"
import * as routes from "./admin.routes"

/** 较长路径规则在前，避免被 /users/:id 误匹配 */
const adminRules: PermissionRule[] = [
  {
    methods: ["POST"],
    path: /\/users\/[^/]+\/change-password\/?$/,
    permission: "users:update",
  },
  {
    methods: ["GET"],
    path: /\/users\/[^/]+\/roles\/?$/,
    permission: "users:read",
  },
  {
    methods: ["POST"],
    path: /\/users\/[^/]+\/roles\/?$/,
    permission: "users:assign",
  },
  {
    methods: ["DELETE"],
    path: /\/users\/[^/]+\/roles\/[^/]+/,
    permission: "users:assign",
  },
  {
    methods: ["GET"],
    path: /\/users\/?$/,
    permission: "users:read",
  },
  {
    methods: ["POST"],
    path: /\/users\/?$/,
    permission: "users:create",
  },
  {
    methods: ["GET"],
    path: /\/users\/[^/]+\/?$/,
    permission: "users:read",
  },
]

const adminGuard = createPermissionGuard(adminRules)

const router = createRouter()
router.use("*", adminGuard)

export default router
  .openapi(routes.listUsers, handlers.listUsers)
  .openapi(routes.createUser, handlers.createUser)
  .openapi(routes.getUser, handlers.getUser)
  .openapi(routes.changePassword, handlers.changePassword)
  .openapi(routes.listUserRoles, handlers.listUserRoles)
  .openapi(routes.assignUserRole, handlers.assignUserRole)
  .openapi(routes.unassignUserRole, handlers.unassignUserRole)
