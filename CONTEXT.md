# Better T Stack

全栈模板项目，提供开箱即用的 Web 应用骨架。

## Language

**Feature (功能模块)**:
按业务领域分组的代码单元，包含 types、API、store、components、pages、nav。
位于 `apps/web/src/features/<domain>/`。
_避免_: 模块 (module)、业务单元 (business unit)

**面包屑 (Breadcrumb)**:
顶部导航路径指示器，显示当前页面在应用中的层级位置。
格式: `项目名 > Feature 标题 > 当前页标题`，由路由 `staticData` 声明式驱动。
_避免_: 导航路径 (nav path)

## Language / Authorization

**权限 (Permission)**:
对一个资源可执行的操作，格式 `resource:action`（如 `tasks:read`）。
由代码常量定义，不存数据库。角色通过 `role_permissions` 表持有权限码列表。
_避免_: 能力 (capability)、策略 (policy)、right

**角色 (Role)**:
权限的集合容器（如 `admin`、`member`）。无层级，不继承。用户可通过多角色组合获得并集权限。
通配 `*:*` 表示全部权限。
_避免_: 用户组 (group)、身份 (identity)

**用户角色 (User Role)**:
用户与角色的多对多关联，存储在 `user_roles` 表。不在此时引入作用域（scope/tenant）。
_避免_: 角色分配 (role assignment)

**通配权限 (Wildcard)**:
特殊权限码 `*:*`，匹配所有资源的所有操作。仅预置的 `admin` 角色持有。
_避免_: 超级管理员权限

## Tooling

**CRUD 脚手架 (gen:crud)**:
一次性生成某实体全套 CRUD 文件的 CLI 脚本（`scripts/gen-crud.ts`，`bun run gen:crud`）。
输入 `--name posts --singular post --title "文章" --fields "name:text(searchable),done:boolean"`，输出 schema/handler/routes/feature/routes 文件。
只**新建**文件，不打开任何既有文件；schema 重导出与 `db:push` 由 stdout TODO 提示人工处理。
_避免_: 代码同步器 (code synchronizer)、注册器 (registrar)
详见 [docs/specs/crud-scaffold-script.md](docs/specs/crud-scaffold-script.md) 与 ADR [0003](docs/adr/0003-crud-scaffold-script.md)。
