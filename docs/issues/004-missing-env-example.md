---
id: 004
priority: P1
status: open
labels: documentation, dx
---

# 缺少 `.env.example` 文件

## 位置

- `apps/server/.env.example` — 不存在
- `apps/web/.env.example` — 不存在

## 问题

新开发者无法快速知道需要配置哪些环境变量。`.dockerignore` 中有排除 `.env` 但保留 `.env.example` 的规则，说明设计上有这个需求但实际未创建。

## 修复建议

根据 `packages/env/src/server.ts` 和 `packages/env/src/web.ts` 中定义的 schema 创建对应的 `.env.example` 文件。
