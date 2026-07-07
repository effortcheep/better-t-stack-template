---
id: 007
priority: P2
status: open
labels: testing
---

# 缺少测试框架配置

## 位置

- 无 `vitest.config.ts` 或 vitest 配置
- `apps/server/src/routes/tasks/tasks.test.ts` 存在但为空
- `package.json` 无测试脚本
- root `package.json` overrides 中有 `vitest` 映射，说明有规划但未实施

## 修复建议

1. 添加 vitest 配置
2. 编写 `tasks.test.ts` 测试用例
3. 在 `package.json` 中添加 `test` 脚本
