import {
  createPermissionGuard,
  crudPermissionRules,
} from "~/middlewares/permission-guard"

import { createRouter } from "~/lib/create-app"

import * as handlers from "./tasks.handler"
import * as routes from "./tasks.routes"

const tasksGuard = createPermissionGuard(crudPermissionRules("tasks", "tasks"))

const router = createRouter()
router.use("*", tasksGuard)

export default router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)
