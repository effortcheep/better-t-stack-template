import { readFile } from "node:fs/promises"
import { readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"

const PERMISSION_FILE = "permission.json"

const permissionDefSchema = z.object({
  code: z.string(),
  description: z.string(),
})

const permissionModuleSchema = z.object({
  module: z.string(),
  permissions: z.array(permissionDefSchema),
})

export type PermissionDef = z.infer<typeof permissionDefSchema>
export type PermissionModule = z.infer<typeof permissionModuleSchema>

const SYSTEM_MODULE: PermissionModule = {
  module: "system",
  permissions: [
    { code: "*:*", description: "超级管理员通配权限" },
  ],
}

let registry: PermissionModule[] = [SYSTEM_MODULE]

async function loadModule(dir: string): Promise<PermissionModule | null> {
  const filePath = join(dir, PERMISSION_FILE)
  if (!existsSync(filePath)) return null

  const raw = await readFile(filePath, "utf-8")
  return permissionModuleSchema.parse(JSON.parse(raw))
}

function getRoutesDir(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return join(__dirname, "..", "routes")
}

export function getAllPermissionModules(): PermissionModule[] {
  return registry
}

export function getAllPermissions(): PermissionDef[] {
  return registry.flatMap((m) => m.permissions)
}

export async function initPermissionRegistry(): Promise<void> {
  const routesDir = getRoutesDir()
  const entries = readdirSync(routesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())

  const modules: PermissionModule[] = [SYSTEM_MODULE]

  for (const entry of entries) {
    const modPath = join(routesDir, entry.name)
    const mod = await loadModule(modPath)
    if (mod) modules.push(mod)
  }

  registry = modules
}