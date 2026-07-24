export interface AdminDetailPageProps {
  adminId: string
}

export default function AdminDetailPage({ adminId }: AdminDetailPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">
        管理员详情 — 待实现（ID: {adminId}）
      </p>
    </div>
  )
}