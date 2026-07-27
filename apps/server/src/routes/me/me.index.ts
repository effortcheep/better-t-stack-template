import { createRouter } from "~/lib/create-app"

import * as handlers from "./me.handler"
import * as routes from "./me.routes"

const router = createRouter()
  .openapi(routes.getMePermissions, handlers.getMePermissions)

export default router