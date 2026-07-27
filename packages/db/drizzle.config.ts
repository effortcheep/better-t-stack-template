import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

/** 支持的 env 文件路径。默认指向 apps/server/.env。
 *  CLI 可通过 DOTENV_CONFIG_PATH 覆盖（相对路径基于 CWD，建议传绝对路径）。 */
const envPath = process.env.DOTENV_CONFIG_PATH ?? "../../apps/server/.env"
dotenv.config({ path: envPath })

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
})
