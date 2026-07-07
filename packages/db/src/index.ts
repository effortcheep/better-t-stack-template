import { env } from "@better-t-stack-template/env/server"
import { drizzle } from "drizzle-orm/node-postgres"

import * as schema from "./schema"
export * from "drizzle-orm"

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema })
}

export const db = createDb()
