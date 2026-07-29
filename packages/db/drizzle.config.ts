import path from "node:path"
import { fileURLToPath } from "node:url"

import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

/** 默认 apps/server/.env；CLI 可通过 DOTENV_CONFIG_PATH 覆盖 (#7) */
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
)
dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH ?? path.join(root, "apps/server/.env"),
})

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
