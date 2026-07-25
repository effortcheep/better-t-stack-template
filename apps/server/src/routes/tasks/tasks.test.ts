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
} from "vitest"

import { createTestApp } from "~/lib/create-app"

import router from "./tasks.index"

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
)

if (process.env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'")
}

const client = testClient(createTestApp(router))

describe("tasks routes", () => {
  beforeAll(async () => {
    execSync("bun db:push", {
      cwd: root,
    })
  })

  afterAll(async () => {
    execSync("echo '444'")
  })

  it("post /api/v1/tasks validates the body when creating", async () => {
    const response = await client.tasks.$post({
      // @ts-expect-error intentionally missing name to test validation
      json: {
        done: false,
      },
    })
    expect(response.status).toBe(422)
    if (response.status === 422) {
    }
  })
})
