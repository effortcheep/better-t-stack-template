import { describe, it, expect } from "vitest"

import {
  hasPermission,
  expandWildcard,
  WILDCARD,
} from "./permissions"

describe("hasPermission", () => {
  it("直接匹配 — 权限集中包含目标权限则通过", () => {
    const perms = new Set(["tasks:read", "tasks:create"])
    expect(hasPermission(perms, "tasks:read")).toBe(true)
  })

  it("不匹配 — 权限集中不包含目标权限则拒绝", () => {
    const perms = new Set(["tasks:read"])
    expect(hasPermission(perms, "tasks:delete")).toBe(false)
  })

  it("通配 `*:*` 匹配任意权限", () => {
    const perms = new Set(["*:*"])
    expect(hasPermission(perms, "tasks:delete")).toBe(true)
    expect(hasPermission(perms, "roles:create")).toBe(true)
    expect(hasPermission(perms, "users:assign")).toBe(true)
  })

  it("无通配 — 按精确匹配判定", () => {
    const perms = new Set(["tasks:read"])
    expect(hasPermission(perms, "tasks:read")).toBe(true)
    expect(hasPermission(perms, "tasks:create")).toBe(false)
  })

  it("空权限集 — 任意检查均拒绝（用户不持有通配", () => {
    const empty = new Set<string>()
    expect(hasPermission(empty, "tasks:read")).toBe(false)
    expect(hasPermission(empty, WILDCARD)).toBe(false)
  })

  it("用户持有通配，检查通配自身也匹配", () => {
    const perms = new Set([WILDCARD])
    expect(hasPermission(perms, WILDCARD)).toBe(true)
  })
})

describe("expandWildcard", () => {
  it("通配返回自身", () => {
    const result = expandWildcard(WILDCARD)
    expect(result).toEqual([WILDCARD])
  })

  it("非通配直接返回自身", () => {
    const result = expandWildcard("tasks:read")
    expect(result).toEqual(["tasks:read"])
  })
})