/**
 * CRUD 脚手架脚本
 *
 * 用法：
 *   bun run gen:crud -- \
 *     --name posts \
 *     --singular post \
 *     --title "文章" \
 *     --fields "name:text(searchable),done:boolean" \
 *     [--force] [--dry-run]
 *
 * 详见 docs/specs/crud-scaffold-script.md。
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import ejs from "ejs"

// ========== 类型 ==========

type FieldType = "text" | "boolean" | "number" | "date"

interface FieldDef {
  name: string
  type: FieldType
  searchable: boolean
}

interface Ctx {
  name: string
  singular: string
  title: string
  Name: string
  Singular: string
  fields: FieldDef[]
  searchField: string | null
}

// ========== argv 解析 ==========

interface Args {
  name: string | null
  singular: string | null
  title: string | null
  fields: string | null
  force: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    name: null,
    singular: null,
    title: null,
    fields: null,
    force: false,
    dryRun: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case "--name":
        args.name = argv[++i]
        break
      case "--singular":
        args.singular = argv[++i]
        break
      case "--title":
        args.title = argv[++i]
        break
      case "--fields":
        args.fields = argv[++i]
        break
      case "--force":
        args.force = true
        break
      case "--dry-run":
        args.dryRun = true
        break
      default:
        throw new Error(`未知参数: ${a}`)
    }
  }
  return args
}

// ========== 字段解析 ==========

const FIELD_TYPES = new Set<FieldType>(["text", "boolean", "number", "date"])

function parseFields(raw: string): FieldDef[] {
  const fields: FieldDef[] = []
  for (const part of raw.split(",")) {
    const seg = part.trim()
    if (!seg) continue
    const m = seg.match(/^(\w+):(\w+)(\(([^)]*)\))?$/)
    if (!m) {
      throw new Error(`字段格式错误: "${seg}"，应为 name:type(flags)`)
    }
    const [, fname, ftype, , flagsRaw] = m
    if (!FIELD_TYPES.has(ftype as FieldType)) {
      throw new Error(
        `未知字段类型: "${ftype}"，支持: ${[...FIELD_TYPES].join(", ")}`,
      )
    }
    const flags = flagsRaw ? flagsRaw.split(",").map((s) => s.trim()) : []
    fields.push({
      name: fname,
      type: ftype as FieldType,
      searchable: flags.includes("searchable"),
    })
  }
  if (fields.length === 0) {
    throw new Error("至少需要一个业务字段")
  }
  const searchableCount = fields.filter((f) => f.searchable).length
  if (searchableCount > 1) {
    throw new Error("最多一个字段可标 (searchable)")
  }
  return fields
}

// ========== 上下文构建 ==========

function upperFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function buildCtx(args: Args): Ctx {
  if (!args.name) throw new Error("缺少必填参数 --name")
  if (!args.singular) throw new Error("缺少必填参数 --singular")
  if (!args.title) throw new Error("缺少必填参数 --title")
  if (!args.fields) throw new Error("缺少必填参数 --fields")

  const fields = parseFields(args.fields)
  const searchField = fields.find((f) => f.searchable)?.name ?? null

  return {
    name: args.name,
    singular: args.singular,
    title: args.title,
    Name: upperFirst(args.name),
    Singular: upperFirst(args.singular),
    fields,
    searchField,
  }
}

// ========== 输出路径表 ==========

interface OutFile {
  relPath: string
  template: string
}

function outFiles(ctx: Ctx): OutFile[] {
  const { name, singular } = ctx
  return [
    // ===== DB (1) =====
    {
      relPath: `packages/db/src/schema/${name}.ts`,
      template: "db/schema.ts.ejs",
    },
    // ===== 后端 (4) =====
    {
      relPath: `apps/server/src/routes/${name}/${name}.handler.ts`,
      template: "server/handler.ts.ejs",
    },
    {
      relPath: `apps/server/src/routes/${name}/${name}.index.ts`,
      template: "server/index.ts.ejs",
    },
    {
      relPath: `apps/server/src/routes/${name}/${name}.routes.ts`,
      template: "server/routes.ts.ejs",
    },
    {
      relPath: `apps/server/src/routes/${name}/${name}.test.ts`,
      template: "server/test.ts.ejs",
    },
    // ===== 前端 feature (8) =====
    {
      relPath: `apps/web/src/features/${name}/types.ts`,
      template: "feature/types.ts.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/api.ts`,
      template: "feature/api.ts.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/nav.tsx`,
      template: "feature/nav.tsx.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/components/columns.tsx`,
      template: "feature/columns.tsx.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/components/${singular}-form.tsx`,
      template: "feature/form.tsx.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/pages/index.tsx`,
      template: "feature/pages/index.tsx.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/pages/add.tsx`,
      template: "feature/pages/add.tsx.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/pages/$${singular}Id/index.tsx`,
      template: "feature/pages/detail.tsx.ejs",
    },
    {
      relPath: `apps/web/src/features/${name}/pages/$${singular}Id/update.tsx`,
      template: "feature/pages/update.tsx.ejs",
    },
    // ===== 前端 routes (4) =====
    {
      relPath: `apps/web/src/routes/_authenticated/${name}/index.tsx`,
      template: "routes/index.tsx.ejs",
    },
    {
      relPath: `apps/web/src/routes/_authenticated/${name}/add.tsx`,
      template: "routes/add.tsx.ejs",
    },
    {
      relPath: `apps/web/src/routes/_authenticated/${name}/$${singular}Id/index.tsx`,
      template: "routes/detail.tsx.ejs",
    },
    {
      relPath: `apps/web/src/routes/_authenticated/${name}/$${singular}Id/update.tsx`,
      template: "routes/update.tsx.ejs",
    },
  ]
}

// ========== 渲染 + 写盘 ==========

const TEMPLATES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "gen-crud",
  "templates",
)

function render(ctx: Ctx, template: string): string {
  const path = join(TEMPLATES_DIR, template)
  if (!existsSync(path)) {
    throw new Error(`模板不存在: ${path}`)
  }
  const src = readFileSync(path, "utf8")
  return ejs.render(src, ctx, { async: false, delimiter: "%" })
}

function touchDir(p: string): void {
  mkdirSync(p, { recursive: true })
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const ctx = buildCtx(args)
  const root = process.cwd()
  const files = outFiles(ctx)

  // 冲突检测
  if (!args.force) {
    const conflicts = files.filter((f) =>
      existsSync(join(root, f.relPath)),
    )
    if (conflicts.length > 0) {
      console.error("以下文件已存在，中止生成：")
      for (const c of conflicts) {
        console.error(`  ${c.relPath}`)
      }
      console.error("\n使用 --force 覆盖。")
      process.exit(1)
    }
  }

  console.log(`生成实体: ${ctx.name} (单数 ${ctx.singular}, "${ctx.title}")`)
  console.log(`字段: ${ctx.fields.map((f) => `${f.name}:${f.type}`).join(", ")}`)
  console.log(`搜索字段: ${ctx.searchField ?? "(无)"}`)
  console.log()

  if (args.dryRun) {
    console.log("--dry-run：将写入以下文件（不实际写盘）：\n")
    for (const f of files) {
      console.log(`  ${f.relPath}`)
    }
    return
  }

  for (const f of files) {
    const abs = resolve(root, f.relPath)
    touchDir(dirname(abs))
    const content = render(ctx, f.template)
    writeFileSync(abs, content, "utf8")
    console.log(`  ✓ ${f.relPath}`)
  }

  console.log()
  console.log("已完成。请手动处理以下 TODO：")
  console.log()
  console.log(`1. [必须] 在 packages/db/src/schema/index.ts 追加：`)
  console.log(`     export * from "./${ctx.name}"`)
  console.log(`2. [必须] 同步数据库：bun db:push`)
  console.log(`3. [可选] 在 apps/server/src/index.ts 注册新路由模块（仿 tasks）`)
  console.log(
    `4. [可选] 在 apps/server/src/lib/permissions.ts 加 ${ctx.name}:read/create/update/delete 权限码`,
  )
  console.log(
    `5. [可选] 在 apps/web/src/components/app-sidebar.tsx import nav 并加进 navMain`,
  )
}

main()
