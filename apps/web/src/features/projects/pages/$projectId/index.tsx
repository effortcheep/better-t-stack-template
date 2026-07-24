export interface ProjectDetailPageProps {
  projectId: string
}

export default function ProjectDetailPage({
  projectId,
}: ProjectDetailPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">
        项目详情 — 待实现（ID: {projectId}）
      </p>
    </div>
  )
}