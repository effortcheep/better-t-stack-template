# Issue tracker: GitHub

Issues 和 PRD 以 GitHub Issues 形式管理，使用 `gh` CLI 操作。

仓库：`effortcheep/better-t-stack-template`

## 约定

- **创建 issue**：`gh issue create --title "..." --body "..."`，多行正文用 heredoc
- **查看 issue**：`gh issue view <编号> --comments`
- **列出 issue**：`gh issue list --state open --json number,title,body,labels,comments`
- **评论 issue**：`gh issue comment <编号> --body "..."`
- **加/删标签**：`gh issue edit <编号> --add-label "..."` / `--remove-label "..."`
- **关闭 issue**：`gh issue close <编号> --comment "..."`

## Pull requests as a triage surface

**PRs as a request surface: no.**（设为 `yes` 时，外部 PR 也会进入 triage 流程，使用对应的 `gh pr` 命令。）

## "publish to the issue tracker"

创建 GitHub issue。

## "fetch the relevant ticket"

运行 `gh issue view <编号> --comments`。