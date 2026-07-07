---
id: 001
priority: P0
status: open
labels: bug, blocking
---

# 空测试文件导致 `bun run check` 失败

## 位置

`apps/server/src/routes/tasks/tasks.test.ts`

## 问题

文件完全为空，oxlint 规则 `unicorn/no-empty-file` 报错为 `error`，阻塞 `bun run check` 通过。

## 修复建议

- 填写测试内容，或
- 删除该文件
