# 权限控制系统（RBAC）

## Problem Statement

当前模板项目缺少统一的权限控制机制。开发者需要自己实现页面可见性、API 保护、按钮条件渲染等权限逻辑，每次从头造轮子。需要一个通用的、可扩展的 RBAC 权限模块，覆盖路由守卫、API 中间件、UI 组件三层管控。

## Solution

提供一套完整的 RBAC 权限系统：扁平角色 + 多角色组合 + Redis 缓存。前端路由和侧边栏由权限配置动态驱动，后端 API 通过声明式中间件保护，按钮级用 `<Can>` 组件控制显隐。

## User Stories

1. 作为系统管理员，我可以创建/编辑/删除角色（Role），并为每个角色分配权限码列表
2. 作为系统管理员，我可以将用户关联到一个或多个角色，该用户获得所有角色的并集权限
3. 作为已登录用户，我的权限列表缓存在 Redis 中，API 调用不需要每次查库
4. 作为管理员，我修改角色权限后，关联用户的缓存即刻失效，下次请求生效
5. 作为前端开发者，我可以在每个 feature 目录下的 `route-config.ts` 中声明路由所需的权限
6. 作为普通用户，我登录后只能看到自己有权访问的路由和侧边栏菜单项
7. 作为普通用户，访问无权限的路由时会看到 403 禁止页面
8. 作为前端开发者，我可以用 `<Can permission="tasks:create">` 包裹任意组件，无权限时自动隐藏
9. 作为后端开发者，我可以在注册路由时加 `requirePermission("tasks:read")` 中间件保护 API
10. 作为后端开发者，我可以定义任意 `resource:action` 格式的权限码，统一维护在常量文件中
11. 作为已登录用户，前端调用 `GET /api/me/permissions` 获取我的权限列表并存入 Zustand store
12. 作为开发者，系统预置 `admin` 角色（通配 `*:*`），开箱即可用权限系统

## Implementation Decisions

- **权限模型**：RBAC，权限码格式 `resource:action`（如 `tasks:read`）。权限码为代码常量（不存数据库），角色通过 `role_permissions` 表持有权限码列表
- **角色模型**：扁平角色，无继承层级。用户可拥有多个角色，有效权限 = 所有角色权限的并集
- **通配**：`*:*` 匹配所有权限，仅预置 `admin` 角色持有
- **权限校验流程**：登录 → `GET /api/me/permissions` → Redis 查角色权限 → 返回权限数组 → 前端存 Zustand
- **缓存策略**：Redis key `permissions:<userId>`，长驻。修改角色时主动删除受影响用户的缓存条目
- **后端中间件**：`requirePermission(...perms: string[])`，Hono middleware，OR 逻辑（任意一个满足即放行），无权限返回信封 403
- **前端路由**：每个 feature 自描述路由配置（`route-config.ts`），`_authenticated` 收集所有配置、按用户权限过滤后动态注册 TanStack Router。侧边栏由同一份配置渲染
- **前端组件权限**：`<Can permission="...">` 声明式包裹组件，从 Zustand store 读权限判断显隐
- **403 页面**：路由级无权限渲染 `/_authenticated/403` 页面；按钮级直接隐藏不显示
- **种子数据**：仅预置 `admin` 角色（`*:*`）。不预置 member 等业务角色
- **本人资源模式**：不内置。由具体项目按需扩展 ABAC 层
- **作用域角色**：暂不引入（`user_roles` 无 scope 字段）。需要时加列 + 改缓存 key，各层可改但不难
- **管理界面**：第一版仅提供后端 API（roles/user_roles CRUD），不提供管理 UI
- **Redis 客户端**：新引入 `ioredis` 依赖
- **数据库表**：新增 `roles`、`role_permissions`、`user_roles` 三张表

## Testing Decisions

- 测试只验证外部行为，不验证实现细节
- 后端：用 `createTestApp()` + 内存/测试 Redis 验证 `requirePermission` 中间件行为（放行/拒绝/403 信封）
- 权限解析逻辑：mock Redis，验证多角色并集、空角色、`*:*` 通配
- 前端 `<Can>` 组件：render 测试验证有权限渲染子组件、无权限返回 null
- 前端路由动态注册：验证权限列表变更后路由树和侧边栏正确过滤
- 参考先例：项目已有 `tasks.handler.ts` 的 handler 级测试模式 + `createTestApp` 工具

## Out of Scope

- 多租户/作用域角色（scope/tenant）
- ABAC / 属性策略 / "本人资源"模式
- 管理后台 UI（roles/users 管理界面）
- Casbin / Oso 等外部策略引擎
- 字段级权限（同一表单不同角色不同字段）
- 数据行级权限过滤
- 二级缓存（本地内存 + Redis）

## Further Notes

- 本方案与 Better Auth 不冲突 — Auth 负责登录/会话，权限负责授权/校验
- `role_permissions` 的 `permission` 字段直接存字符串，不建独立 permissions 表（权限定义在代码常量中，不需要存表）
- 后续若需要更复杂的策略（IP 白名单、时间段限制），可在 `requirePermission` 中间件中扩展 ABAC 规则