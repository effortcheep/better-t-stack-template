import { Scalar } from "@scalar/hono-api-reference"

import packageJSON from "../../package.json" with { type: "json" }
import type { AppOpenAPI } from "./type"

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    // OpenAPI 3.0.0 (https://spec.openapis.org/oas/v3.0.0) 是一个描述 REST API 的标准格式
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Template API",
    },
  })

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  )
}
