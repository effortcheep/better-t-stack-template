import { drizzle } from "drizzle-orm/node-postgres"

const db = drizzle(process.env.DATABASE_URL!)

try {
  const result = await db.execute(
    "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
  )
  console.log("Tables:", result)
} catch (e) {
  console.error("Error:", (e as Error).message)
  if ((e as any).cause) {
    console.error("Cause:", (e as any).cause.message)
  }
}