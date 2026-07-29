import { execSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { testClient } from "hono/testing"
import {
  describe,
  beforeAll,
  afterAll,
  it,
  expect,
  vi,
} from "vitest"

import { createAuthTestApp } from "~/test-helpers/create-auth-test-app"

import router from "./tasks.index"

vi.mock("~/services/permission-cache", () => ({
  getUserPermissions: vi.fn().mockResolvedValue(["*:*"]),
}))

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

if (process.env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'")
}

const client = testClient(createAuthTestApp(router))

describe("tasks routes", () => {
  beforeAll(async () => {
    execSync("bun db:push", {
      cwd: root,
    })
  })

  afterAll(async () => {
    // no-op
  })

  it("post /api/v1/tasks validates the body when creating", async () => {
    const response = await client.tasks!.$post({
      json: {
        done: false,
      } as { name: string; done: boolean },
    })
    expect(response.status).toBe(422)
  })
})
