---
id: 008
priority: P2
status: open
labels: ci/cd
---

# 缺少 CI/CD 配置

## 问题

- 无 `.github/workflows/` 目录
- 无 `.gitlab-ci.yml`
- 无任何持续集成配置

## 修复建议

添加 GitHub Actions 工作流，至少包含：

- Lint (oxlint + oxfmt)
- 类型检查 (`bun run check-types`)
- 构建 (`bun run build`)
