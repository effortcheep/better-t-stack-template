---
id: 002
priority: P1
status: open
labels: bug, typo
---

# 多处拼写错误

## 位置和修复

| 文件                                           | 行  | 错误                        | 正确                        |
| ---------------------------------------------- | --- | --------------------------- | --------------------------- |
| `apps/server/src/lib/configure-open-api.ts`    | 13  | `"Templete API"`            | `"Template API"`            |
| `apps/server/src/lib/configure-open-api.ts`    | 18  | `"/refrence"`               | `"/reference"`              |
| `apps/server/src/lib/configure-open-api.ts`    | 25  | `"featch"`                  | `"fetch"`                   |
| `apps/server/src/routes/tasks/tasks.routes.ts` | 27  | `"The taks to create"`      | `"The task to create"`      |
| `apps/server/src/routes/tasks/tasks.routes.ts` | 34  | `"THe validation error(s)"` | `"The validation error(s)"` |
| `apps/server/src/routes/tasks/tasks.routes.ts` | 47  | `"The request task"`        | `"The requested task"`      |
| `apps/server/src/routes/tasks/tasks.routes.ts` | 56  | `"The tasks to update"`     | `"The task to update"`      |
| `packages/db/src/tasks.ts`                     | 18  | `inserTasksSchema`          | `insertTasksSchema`         |

> `inserTasksSchema` 在 routes 和 handler 中被多处引用，需一并修改。
