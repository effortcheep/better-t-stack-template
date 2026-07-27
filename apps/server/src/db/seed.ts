import { config } from "dotenv"

config({ path: new URL("../../.env", import.meta.url).pathname })

import { db, eq } from "@better-t-stack-template/db"
import { roles, rolePermissions } from "@better-t-stack-template/db/schema/authz"
import { WILDCARD } from "~/lib/permissions"

async function seed() {
  console.log("🌱 种子开始…")

  await db
    .insert(roles)
    .values({ id: "role_admin", name: "admin", description: "超级管理员" })
    .onConflictDoNothing()
  console.log("  ✅ admin 角色")

  await db
    .delete(rolePermissions)
    .where(eq(rolePermissions.roleId, "role_admin"))
  await db.insert(rolePermissions).values({
    id: "rp_admin_wildcard",
    roleId: "role_admin",
    permission: WILDCARD,
  })
  console.log("  ✅ *:* 通配权限")

  console.log("🌱 种子完成")
}

async function main() {
  try {
    await seed()
    process.exit(0)
  } catch (err) {
    console.error("种子失败:", err)
    process.exit(1)
  }
}

main()