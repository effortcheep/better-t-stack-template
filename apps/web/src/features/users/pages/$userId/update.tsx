export interface UserUpdatePageProps {
  userId: string
}

export default function UserUpdatePage({ userId }: UserUpdatePageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">
        编辑用户 — 待实现（ID: {userId}）
      </p>
    </div>
  )
}