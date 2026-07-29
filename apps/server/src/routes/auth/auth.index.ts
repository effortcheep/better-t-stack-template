import { createRouter } from "~/lib/create-app"
import { rateLimit } from "~/middlewares/rate-limit"

import * as handlers from "./auth.handler"
import * as routes from "./auth.routes"

const authRateLimit = rateLimit({
  windowMs: 60_000,
  max: 30,
  keyPrefix: "auth",
})

const router = createRouter()
router.use("/login", authRateLimit)
router.use("/register", authRateLimit)

export default router
  .openapi(routes.login, handlers.login)
  .openapi(routes.register, handlers.register)
  .openapi(routes.logout, handlers.logout)
  .openapi(routes.checkUsername, handlers.checkUsername)