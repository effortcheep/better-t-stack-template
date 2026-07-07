---
id: 009
priority: P2
status: open
labels: config, consistency
---

# 包配置文件不一致

## 问题

| 包                              | 缺失项                                  |
| ------------------------------- | --------------------------------------- |
| `packages/auth`                 | 缺少 `version` 字段、`check-types` 脚本 |
| `packages/db`                   | 缺少 `version` 字段                     |
| `packages/env`                  | 缺少 `check-types` 脚本                 |
| `packages/config`               | 缺少 `"type": "module"`                 |
| `packages/auth` / `packages/db` | 缺少 `"private": true`                  |

## 修复建议

统一所有内部包的 `package.json` 字段：

- `"version": "0.0.0"`
- `"private": true`
- `"type": "module"`
- 添加 `"check-types": "tsc --noEmit"` 脚本（auth 和 env）
