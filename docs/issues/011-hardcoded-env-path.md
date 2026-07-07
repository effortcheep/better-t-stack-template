---
id: 011
priority: P3
status: open
labels: config, improvement
---

# Drizzle 配置硬编码环境变量路径

## 位置

`packages/db/drizzle.config.ts:4-6`

## 问题

```ts
dotenv.config({ path: "../../apps/server/.env" })
```

依赖相对路径，工作目录不同时可能失败。

## 修复建议

使用 `@better-t-stack-template/env/server` 统一管理环境变量，消除硬编码路径。
