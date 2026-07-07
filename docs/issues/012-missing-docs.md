---
id: 012
priority: P3
status: open
labels: documentation
---

# 缺少文档

## 问题

- 无贡献指南 (`CONTRIBUTING.md`)
- 无变更日志 (`CHANGELOG.md`)
- 无 API 文档说明
- 无开发指南

## 服务器 Dockerfile 多余设置

`apps/server/Dockerfile` 中 `ENV SKIP_ENV_VALIDATION=` 将环境变量设为空字符串，而源码中通过 `!!process.env.SKIP_ENV_VALIDATION` 判断，空字符串结果也是 `false`，该行是多余噪音。
