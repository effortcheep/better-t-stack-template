export interface AdminUpdatePageProps {
  adminId: string
}

export default function AdminUpdatePage({ adminId }: AdminUpdatePageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">
        编辑管理员 — 待实现（ID: {adminId}）
      </p>
    </div>
  )
}