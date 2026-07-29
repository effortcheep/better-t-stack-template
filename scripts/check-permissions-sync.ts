#!/usr/bin/env bun
/**
 * 比对前端权限常量与后端 permission.json (#37)
 * 用法: bun run scripts/check-permissions-sync.ts
 */
import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

const root = join(import.meta.dir, "..")
const webPermsPath = join(root, "apps/web/src/lib/permissions.ts")
const routesDir = join(root, "apps/server/src/routes")

async function loadBackendCodes(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const entries = await readdir(routesDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const jsonPath = join(routesDir, entry.name, "permission.json")
    try {
      const raw = await readFile(jsonPath, "utf8")
      const mod = JSON.parse(raw) as {
        module?: string
        permissions?: { code: string; description?: string }[]
      }
      for (const p of mod.permissions ?? []) {
        map.set(p.code, `${entry.name}/permission.json`)
      }
    } catch {
      // 无 permission.json 的模块跳过
    }
  }
  return map
}

function loadFrontendCodes(source: string): Set<string> {
  const codes = new Set<string>()
  const re = /:\s*"([a-z_]+:[a-z]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) {
    codes.add(m[1]!)
  }
  return codes
}

const backend = await loadBackendCodes()
const frontendSource = await readFile(webPermsPath, "utf8")
const frontend = loadFrontendCodes(frontendSource)

const missingInBackend: string[] = []
const missingInFrontend: string[] = []

for (const code of frontend) {
  if (!backend.has(code)) missingInBackend.push(code)
}
for (const code of backend.keys()) {
  if (!frontend.has(code)) missingInFrontend.push(code)
}

if (missingInBackend.length || missingInFrontend.length) {
  console.error("❌ 权限码不一致:")
  for (const c of missingInBackend) {
    console.error(`  前端有、后端无: ${c}`)
  }
  for (const c of missingInFrontend) {
    console.error(`  后端有、前端无: ${c} (${backend.get(c)})`)
  }
  process.exit(1)
}

console.log(`✅ 权限码一致 (${frontend.size} 个)`)
