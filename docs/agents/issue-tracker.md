# Issue tracker: Local Markdown

Issues 和 PRD 以 markdown 文件形式存放在 `docs/issues/` 下。

## 约定

- 基于 PRD 的功能目录：`docs/issues/<feature-slug>/`
- PRD 文件：`docs/issues/<feature-slug>/PRD.md`
- 功能相关的实现 issue：`docs/issues/<feature-slug>/NN-<slug>.md`
- 顶层独立 issue：`docs/issues/NNN-<slug>.md`，按序编号
- Triage 状态以 `Status:` 行记录在 issue 文件头部（状态值见 `triage-labels.md`）
- 评论和对话记录追加在文件末尾 `## Comments` 标题下

## "publish to the issue tracker"

在 `docs/issues/` 下创建新文件（必要时先创建功能目录）。

## "fetch the relevant ticket"

读取对应路径的 issue 文件。用户通常会直接传路径或编号。