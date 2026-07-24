# 面包屑采用路由声明式而非 Zustand store

面包屑由 TanStack Router 的 `staticData` + `useMatches()` 驱动，而非页面组件通过 zustand store 命令式更新。前缀为项目名常量 "Better T Stack"。

## Status

Accepted

## Considered Options

- **Zustand store** (`stores/breadcrumb.ts`): 页面组件在挂载时调用 `setItems([...])` 设置完整面包屑。灵活但需要每个页面手动同步，可能遗漏或产生路由回退时的状态不一致。
- **路由声明式** (选中): 每个 leaf route 的 `staticData` 声明 `breadcrumbs: [{ label, href? }]`，布局组件用 `useMatches()` 遍历匹配链自动推导。零手动同步，路由切换自动刷新。

## Consequences

- 面包屑数据与路由定义同址，添加新页面时不易遗漏
- 删除 `stores/breadcrumb.ts`，减少一个全局 store
- 静态 `staticData` 无法访问路由参数 — 详情/编辑页标题为静态标签（"详情"/"编辑"），不拼接 ID
