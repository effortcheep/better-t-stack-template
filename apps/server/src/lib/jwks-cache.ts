import { db, eq } from "@better-t-stack-template/db"
import { jwks } from "@better-t-stack-template/db/schema/auth"
import { importJWK } from "jose"

type CachedKey = {
  id: string
  publicKey: string
  createdAt: Date
}

/** JWKS 内存缓存 — 避免每次请求全表扫描 (#34) */
let cache: CachedKey[] | null = null
let loadedAt = 0
const TTL_MS = 60_000

async function loadKeys(): Promise<CachedKey[]> {
  const now = Date.now()
  if (cache && now - loadedAt < TTL_MS) return cache

  cache = await db.select().from(jwks)
  loadedAt = now
  return cache
}
export async function resolveJwkRow(kid: string | null) {
  const keys = await loadKeys()
  if (keys.length === 0) return null

  if (kid) {
    const match = keys.find((k) => k.id === kid)
    if (match) return match
  }

  return keys.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]!
}

export async function importPublicKeyFromRow(row: CachedKey) {
  const jwk = JSON.parse(row.publicKey) as { alg?: string }
  return importJWK(jwk, jwk.alg || "EdDSA")
}

/** 密钥轮换后主动失效缓存（测试 / 管理脚本可调用） */
export function invalidateJwksCache() {
  cache = null
  loadedAt = 0
}

/** 按 id 预热单条 key（kid 精确查询路径） */
export async function getJwkRowById(id: string) {
  const [row] = await db.select().from(jwks).where(eq(jwks.id, id))
  if (row) invalidateJwksCache()
  return row ?? null
}
