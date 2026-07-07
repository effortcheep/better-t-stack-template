---
id: 010
priority: P2
status: open
labels: cleanup
---

# 空目录和死代码清理

## 问题

### 空目录

- `packages/db/src/lib/` — 完全为空
- `packages/ui/src/hooks/` — 仅含 `.gitkeep`

### 注释掉的代码

- `apps/server/src/index.ts:32` — `// app.get("/", (c) => { return c.text("OK") })`
- `apps/server/src/routes/tasks/tasks.handler.ts:28-33` — 注释掉的 404 处理逻辑

### 混用中英文注释

- `apps/server/src/lib/configure-open-api.ts:9` — 中英文混用，其余代码均为英文

## 修复建议

- 删除空目录或在其中放置实际代码
- 按规范删除注释掉的代码
- 统一注释为英文
