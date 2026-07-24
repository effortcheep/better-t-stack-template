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