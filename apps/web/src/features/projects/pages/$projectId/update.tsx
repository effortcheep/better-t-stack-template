export interface ProjectUpdatePageProps {
  projectId: string
}

export default function ProjectUpdatePage({
  projectId,
}: ProjectUpdatePageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">
        编辑项目 — 待实现（ID: {projectId}）
      </p>
    </div>
  )
}