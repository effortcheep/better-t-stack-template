import { createRouter } from "~/lib/create-app"

import * as handlers from "./auth.handler"
import * as routes from "./auth.routes"

const router = createRouter()
  .openapi(routes.login, handlers.login)
  .openapi(routes.register, handlers.register)
  .openapi(routes.logout, handlers.logout)
  .openapi(routes.checkUsername, handlers.checkUsername)

export default router