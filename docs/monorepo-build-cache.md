# Monorepo 构建缓存评估 (#61)

## 现状

- 使用 Vite+ (`vp run -r`) 做 workspace 任务编排
- Bun catalog 统一部分依赖版本

## 结论

**暂不引入 Turborepo**。理由：

1. 当前包数量少（apps 2 + packages 5），`vp run` 足够
2. Vite+ 已提供 task graph 与缓存（`vp run --last-details`）
3. 引入 Turborepo 增加配置与认知成本，收益有限

若未来 workspace 超过 ~15 包或 CI 明显变慢，再评估 Turborepo / Nx。
