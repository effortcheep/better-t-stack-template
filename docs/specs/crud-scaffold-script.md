# CRUD 脚手架脚本（gen-crud）

`bun run gen:crud` 一次性生成一个实体的全套 CRUD 文件。脚手架范围仅限"新建文件"，不修改既有文件。

参考 ADR: [0003-crud-scaffold-script](../adr/0003-crud-scaffold-script.md)

## CLI 接口

```bash
bun run gen:crud -- \
  --name posts \
  --singular post \
  --title "文章" \
  --fields "name:text(searchable),done:boolean"
```

### 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--name` | ✅ | 实体复数形式，用作表名、路由路径、菜单 url（如 `posts`） |
| `--singular` | ✅ | 实体单数形式，用作 param 名、变量名（如 `post` → `$postId`） |
| `--title` | ✅ | 实体中文标题，用于菜单标题、面包屑、页面 H1、Toast 文案（如 `文章`） |
| `--fields` | ✅ | 业务字段列表，逗号分隔，每项 `<name>:<type>(<flags>)` |
| `--force` | 否 | 目标路径已存在时整体覆盖；默认整体中止 |

### 字段类型与 UI 控件映射

| CLI 类型 | DB 列 | 前端 Zod schema | 表单控件 | 表格列 | 详情页 |
|---|---|---|---|---|---|
| `text` | `text()` | `z.string().min(1).max(500)` | `<Input />` | 文本 | 文本 |
| `boolean` | `boolean()` | `z.boolean()` | `<Switch />` | 只读 `<Switch />` | "已完成/未完成" |
| `number` | `integer()` | `z.number()` | `<Input type=number />` | 数字 | 数字 |
| `date` | `timestamp()` | `z.coerce.date()` | `<Input type=date />` | 本地化日期 | 本地化日期 |

### 字段 flag

| flag | 适用类型 | 作用 |
|---|---|---|
| `searchable` | text | 列表页搜索框用此字段，`searchKey="<name>"`（最多一个；多个时取第一个） |

### 硬编码字段

所有生成 schema 自带三个字段，CLI `--fields` 不需、也不允许传：

- `id: serial().primaryKey()`
- `createdAt: timestamp("created_at").defaultNow().notNull()`
- `updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull()`

这三个字段在前端 Zod schema、列表列、详情页中按 tasks 现有模式处理：列表显示 `#`/名称/搜索列/.../`createdAt`/操作；详情页显示全部字段。`id` 永不出现在 `<EntityForm>`。

### 单数推 params

- `--singular post` → 前端路由 `$postId`、详情页 `PostDetailPage`、`{ postId: string }` 入参。
- 不内置任何自动单数化（如 `posts → post`、`categories → category`），全部由 CLI 显式传入。

## 生成文件清单（共 14 个）

### 后端（4 个）
```
apps/server/src/routes/<name>/
  ├─ <name>.handler.ts        # drizzle CRUD，参考 tasks.handler.ts
  ├─ <name>.index.ts          # createRouter().openapi(...) 链
  ├─ <name>.routes.ts         # 5 个 createRoute（list/create/getOne/update/remove）
  └─ <name>.test.ts          # 仅一条 422 校验测试
```

### DB schema（1 个）
```
packages/db/src/schema/<name>.ts   # pgTable + select/insert/patch zod schema
```

### 前端 feature（8 个）
```
apps/web/src/features/<name>/
  ├─ types.ts                     # 手写 TS 类型 + Zod schema（不复用 drizzle-zod）
  ├─ api.ts                       # fetch + getToken()，5 个 TanStack Query hooks
  ├─ nav.tsx                      # nav 导出（不在本脚本范围联动 app-sidebar）
  ├─ components/
  │   ├─ columns.tsx              # TanStack Table 列定义
  │   └─ <singular>-form.tsx      # TanStack Form，业务字段 + 验证
  └─ pages/
      ├─ index.tsx                # 列表页（服务端分页/排序/筛选）
      ├─ add.tsx                  # 新建页
      └─ $<singular>Id/
          ├─ index.tsx            # 详情页
          └─ update.tsx           # 编辑页
```

### 前端 routes（4 个）
```
apps/web/src/routes/_authenticated/<name>/
  ├─ index.tsx                    # searchSchema + requirePermission("<name>:read")
  ├─ add.tsx                      # requirePermission("<name>:create")
  └─ $<singular>Id/
      ├─ index.tsx               # requirePermission("<name>:read")
      └─ update.tsx              # requirePermission("<name>:update")
```

## 不在脚本范围（手动处理）

运行后 stdout 必须打印以下 TODO 清单：

1. **必须**：在 `packages/db/src/schema/index.ts` 追加 `export * from "./<name>"`
2. **必须**：跑 `bun db:push` 把新表结构同步到数据库
3. **可选**：在 `apps/server/src/index.ts` 仿照 tasks 注册新路由模块
4. **可选**：在 `apps/server/src/lib/permissions.ts` 仿照 tasks 加 `<name>:read/create/update/delete` 权限码
5. **可选**：在 `apps/web/src/components/app-sidebar.tsx` 仿照 tasks 把 `nav` 加进 `navMain`

脚手架本身不打开这几个文件。

## 行为细节

### 幂等性
- 默认：任意目标文件已存在 → 立刻中止，列出已存在文件清单。
- `--force`：覆盖所有目标文件。

### 模板引擎
- 使用 `ejs`（npm 包），新增为根 `package.json` devDependency。
- 模板文件放 `scripts/gen-crud/templates/` 下，后缀 `.ejs`，运行时渲染后写盘（去掉 `.ejs` 后缀）。

### 脚本入口
- `scripts/gen-crud.ts`（bun 直接执行的 `.ts`）。
- 根 `package.json` 追加脚本：`"gen:crud": "bun run scripts/gen-crud.ts"`。

### 实现参考
脚本与所有模板严格仿照现有 `tasks` 实体的实现：
- schema: `packages/db/src/schema/tasks.ts`
- 后端: `apps/server/src/routes/tasks/tasks.*.ts`
- 前端 feature: `apps/web/src/features/tasks/**`
- 前端 routes: `apps/web/src/routes/_authenticated/tasks/**`

模板渲染时，至少注入以下上下文变量：
- `name`（复数）、`singular`（单数）
- `Name`（Pascal，复数首字母大写）、`Singular`（Pascal 单数）
- `fields`（解析后的字段数组：`{ name, type, searchable }[]`）
- `searchField`（首标 `searchable` 的字段名，无则列表页不生成搜索框，`searchKey` 改为 `null`/省略 `<DataTableToolbar searchKey=...>`）
- `tableName`（drizzle 表变量名，与 `name` 相同）
- `title`（中文标题，CLI `--title` 传入，用于菜单/面包屑/页面 H1/Toast，如 "文章"）

### 中文标题渲染位置
渲染模板时 `title` 注入以下位置：

- `nav.tsx`: `title: "<文章>管理"`
- routes `staticData.breadcrumbs`: `[{ label: "<文章>管理", href: "/<name>" }, { label: "<文章>列表" }]`
- pages H1: `任务列表` → `<title>列表`、`新建任务` → `新建<title>`、`编辑任务` → `编辑<title>`、`任务不存在` → `<title>不存在`
- Toast: `创建成功` → `<title>创建成功`、`<title>更新成功`、`<title>删除成功`
