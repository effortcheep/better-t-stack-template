import { cn } from "@better-t-stack-template/ui/lib/utils"
import { Button } from "@better-t-stack-template/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@better-t-stack-template/ui/components/field"
import { Input } from "@better-t-stack-template/ui/components/input"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"

interface LoginFormProps {
  onSubmit: (values: { loginId: string; password: string }) => Promise<void>
  error?: string | null
  isPending?: boolean
  className?: string
}

export function LoginForm({
  onSubmit,
  error,
  isPending,
  className,
  ...props
}: LoginFormProps) {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ loginId, password })
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">账号登录</h1>
          <p className="text-sm text-balance text-muted-foreground">
            输入用户名或邮箱登录
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="loginId">用户名 / 邮箱</FieldLabel>
          <Input
            id="loginId"
            type="text"
            placeholder="username 或 user@example.com"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            disabled={isPending}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">密码</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isPending}
          />
        </Field>

        {error && (
          <Field>
            <FieldError>{error}</FieldError>
          </Field>
        )}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                登录中...
              </>
            ) : (
              "登录"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}