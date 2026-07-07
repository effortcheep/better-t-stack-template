---
id: 006
priority: P2
status: open
labels: code-quality, type-safety
---

# `packages/env/src/web.ts` 使用 `any` 类型

## 位置

`packages/env/src/web.ts:9`

## 问题

```ts
const runtimeEnv = (import.meta as any).env
```

使用 `any` 绕过类型检查，违反项目规范。

## 修复建议

为 Vite 的 `import.meta.env` 定义明确的类型声明，或使用 `ImportMeta` 接口扩展。
