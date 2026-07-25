import { createDb } from "@better-t-stack-template/db"
import * as schema from "@better-t-stack-template/db/schema/auth"
import { env } from "@better-t-stack-template/env/server"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { bearer, jwt, username } from "better-auth/plugins"

export function createAuth() {
  const db = createDb()

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",

      schema: schema,
    }),
    basePath: "/api/v1/auth",
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    plugins: [
      username(),
      jwt({
        jwt: {
          expirationTime: "7d",
          definePayload: (session) => ({
            id: session.user.id,
            email: session.user.email,
            username: (session.user as any).username,
            name: session.user.name,
            image: session.user.image,
          }),
        },
      }),
      bearer({ requireSignature: true }),
    ],
  })
}

export const auth = createAuth()
