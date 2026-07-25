import { useNavigate, useSearch } from "@tanstack/react-router"
import { GalleryVerticalEndIcon } from "lucide-react"
import { useState } from "react"

import { login } from "@/lib/auth"
import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: "/login" })
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (values: { loginId: string; password: string }) => {
    setError(null)
    setIsPending(true)
    try {
      const isEmail = values.loginId.includes("@")
      await login({
        ...(isEmail ? { email: values.loginId } : { username: values.loginId }),
        password: values.password,
      })
      const redirect = search.redirect ?? "/"
      navigate({ to: redirect, replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-2 font-medium"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              onSubmit={handleSubmit}
              error={error}
              isPending={isPending}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}