import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

dotenv.config({
  path: "../../apps/server/.env",
})

console.log("123", process.env.DATABASE_URL)

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
})
