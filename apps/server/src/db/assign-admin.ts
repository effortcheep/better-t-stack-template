import { config } from "dotenv"

config({ path: new URL("../../.env", import.meta.url).pathname })

import { db, eq } from "@better-t-stack-template/db"
import { user } from "@better-t-stack-template/db/schema/auth"
import {
  roles,
  rolePermissions,
  userRoles,
} from "@better-t-stack-template/db/schema/authz"
import { WILDCARD } from "~/lib/permissions"
import * as readline from "node:readline"

/**
 * 将指定用户指派为管理员。
 * 交互式脚本：列出所有用户，操作者选一个，幂等写入 user_roles。
 *
 * 用法：bun run db:assign-admin
 */

/** 确保 admin 角色和通配权限存在（幂等）。 */
async function ensureAdminRole() {
  await db
    .insert(roles)
    .values({ id: "role_admin", name: "admin", description: "超级管理员" })
    .onConflictDoNothing()

  await db
    .delete(rolePermissions)
    .where(eq(rolePermissions.roleId, "role_admin"))
  await db.insert(rolePermissions).values({
    id: "rp_admin_wildcard",
    roleId: "role_admin",
    permission: WILDCARD,
  })
}

async function main() {
  /* 1. 确保 admin 角色存在 */
  await ensureAdminRole()

  /* 2. 列出所有用户 */
  const users = await db.select().from(user)
  if (users.length === 0) {
    console.log("⚠ 暂无注册用户，请先注册后再运行此脚本。")
    process.exit(0)
  }

  console.log("\n📋 用户列表：\n")
  users.forEach((u, i) => {
    const label = [u.displayUsername, u.email, `id=${u.id.slice(0, 8)}…`]
      .filter(Boolean)
      .join(" | ")
    console.log(`  ${i + 1}. ${label}`)
  })
  console.log(`\n  0. 退出\n`)

  /* 3. 交互式选择 */
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await new Promise<string>((resolve) => {
    rl.question("请选择要指派为管理员的用户序号 → ", resolve)
  })
  rl.close()

  const index = parseInt(answer, 10)
  if (isNaN(index) || index < 1 || index > users.length) {
    console.log(index === 0 ? "已退出。" : "无效序号，退出。")
    process.exit(0)
  }

  const target = users[index - 1]!

  /* 4. 幂等指派 */
  await db
    .insert(userRoles)
    .values({
      id: `ur_${target.id}_admin`,
      userId: target.id,
      roleId: "role_admin",
    })
    .onConflictDoNothing()

  console.log(
    `\n✅ 已将 ${target.displayUsername ?? target.email ?? target.id} 指派为管理员`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error("指派失败:", err)
  process.exit(1)
})