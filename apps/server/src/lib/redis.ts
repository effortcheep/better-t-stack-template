import { env } from "@better-t-stack-template/env/server"
import Redis from "ioredis"

/**
 * Redis 客户端单例。
 * connectTimeout 和 maxRetriesPerRequest 针对模板项目默认本地 Redis 调优：
 * 快速失败而非长时间阻塞。
 */
export const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 3000,
  maxRetriesPerRequest: 2,
  lazyConnect: true,
})

/** 预热连接，失败不阻断启动 — Redis 在模板项目中是可降级依赖。 */
redis.connect().catch((err) => {
  console.warn("⚠ Redis 连接失败（降级运行）:", err.message)
})