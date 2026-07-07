---
id: 003
priority: P1
status: open
labels: bug, api
---

# Tasks handler 缺少 404 错误处理

## 位置

`apps/server/src/routes/tasks/tasks.handler.ts`

## 问题

### `getOne` (第 27-34 行)

- 当 task 不存在时返回 `undefined` 而非 404 错误
- 有注释掉的 404 处理代码未启用

### `update` (第 42 行)

- 未处理 task 不存在的情况

## 修复建议

取消注释或重新实现 404 处理逻辑，两个 handler 都需要返回明确的 404 响应。
