export interface UserDetailPageProps {
  userId: string
}

export default function UserDetailPage({ userId }: UserDetailPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">
        用户详情 — 待实现（ID: {userId}）
      </p>
    </div>
  )
}