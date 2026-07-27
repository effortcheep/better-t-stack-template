# CRUD 脚手架脚本只生成新文件，不联动注册点

`bun run gen:crud` 通过 ejs 模板生成一个实体的全套 CRUD 文件（DB schema、后端 handler/routes/index/test、前端 feature types/api/nav/components/pages、前端 routes）。脚本只新建文件，对任何既有文件零写入，所有「注册联动」由人类手动追加。

## Status

Accepted

## Context

项目存在三个手动注册点：

- `apps/server/src/index.ts:43` — 后端路由挂到 `routes` 数组
- `apps/server/src/lib/permissions.ts:7-23` — 权限码常量
- `apps/web/src/components/app-sidebar.tsx:46-54` — 前端菜单 `navMain` 数组
- `packages/db/src/schema/index.ts` — schema 重导出（`db.query.*` 依赖）

可选项：(A) 脚本 AST 改写这些文件自动联动；(B) 脚本仅打印 TODO，人工加。讨论中明确：脚本不引入对既有源码的写操作，降低风险并保持脚本的纯粹「生成器」职责。菜单与权限由用户主动跳过（不在本脚本范围），schema 重导出与 db:push 走 TODO 提示。

## Decision

- **唯一职责**：在四个目录里新建文件，不打开任何既有 `.ts/.tsx`。
- **DDD 兜底**：对必须改的 `schema/index.ts`（`db.query.posts` 才可用），脚本只在 stdout 打印一行 TODO，不写入。
- **幂等性**：任何目标文件已存在 → 整体中止并列出冲突清单；`--force` 覆盖。
- **DB migration**：生成完毕后 stdout 提示用户跑 `bun db:push`，不自动 exec。
- **单数推 params**：CLI 必须同时传 `--name` 与 `--singular`（不内置单数化规则），用于生成 `$<singular>Id` 这种 param 名。

## Consequences

- 用户体验：每生成一个实体需手动追加 schema 重导出一行 + 跑 `bun db:push`；前端菜单与权限视需求另行手动处理。
- 脚本实现：纯 ejs 模板渲染 + 文件写入，无 AST 改写、无依赖注入既有源码。
- 风险：用户可能忘记追加 `export *` 行，运行时 `db.query.<name>` undefined。脚本通过 TODO 提示降低概率。
- 「菜单/权限最终不生成」是用户在 grilling 中明确放弃的范围，未来如需联动注册，需另起 issue。
