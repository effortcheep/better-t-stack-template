# 测试环境说明 (#36)

## 环境文件

- 复制 `apps/server/.env.test.example` → `apps/server/.env.test`
- 测试脚本通过 `DOTENV_CONFIG_PATH=.env.test` 加载（见 `apps/server/package.json`）

## 数据库策略

- **本地 / CI**：`bun db:push` 同步 schema（集成测试 `beforeAll` 中调用）
- **生产**：`bun db:migrate` 应用迁移文件

## 运行测试

```bash
cd apps/server && bun run test
```

## 未来：Testcontainers (#56)

CI workflow 已使用 GitHub Actions `services:` 提供 Postgres + Redis。
本地可选用 Docker Compose（`docker compose up -d`）或 Testcontainers 进一步解耦。
