## Agent skills

### Issue tracker

Issues 和 PRD 以 GitHub Issues 形式管理。详见 `docs/agents/issue-tracker.md`。

### Triage labels

使用五个标准 triage 角色（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`）。详见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文布局：根目录 `CONTEXT.md` + `docs/adr/`。详见 `docs/agents/domain.md`。

## 架构约束（#72）

- **认证**：JWT Bearer + Better Auth；白名单见 `apps/server/src/lib/auth-whitelist.ts`
- **RBAC**：后端 `permission-guard.ts` 声明式规则；前端 per-route `beforeLoad` + `<Can>`
- **权限码 SSOT**：`apps/server/src/routes/*/permission.json`；CI 脚本 `bun run check:permissions`
- **API 信封**：`{ ret, msg, data }`；业务错误用 `err()` helper
- **403 方案**：wontfix 专用路由 — 使用 `AppError(403)` + `ErrorPage`（见 #41）
- **测试**：`apps/server/.env.test` + `docs/testing.md`；CI 见 `.github/workflows/ci.yml`
