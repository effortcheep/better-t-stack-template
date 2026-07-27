import { createRouter } from "~/lib/create-app"
import * as handlers from "./admin.handler"
import * as routes from "./admin.routes"

const router = createRouter()

router
  .openapi(routes.listUsers, handlers.listUsers)
  .openapi(routes.createUser, handlers.createUser)
  .openapi(routes.getUser, handlers.getUser)
  .openapi(routes.changePassword, handlers.changePassword)
  .openapi(routes.listUserRoles, handlers.listUserRoles)
  .openapi(routes.assignUserRole, handlers.assignUserRole)
  .openapi(routes.unassignUserRole, handlers.unassignUserRole)

export default router