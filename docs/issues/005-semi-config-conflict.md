---
id: 005
priority: P1
status: open
labels: bug, config
---

# Oxfmt `semi` 配置冲突

## 位置

- `.oxfmtrc.json`：`"semi": false`（不添加分号）
- `vite.config.ts` 中 fmt 配置：`"semi": true`（添加分号）

## 问题

两处配置互斥，不同工具运行结果不一致。

## 修复建议

统一为 `false`（与 `.oxfmtrc.json` 一致），或统一为 `true`。
