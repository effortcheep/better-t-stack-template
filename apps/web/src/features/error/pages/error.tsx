import { Button } from "@better-t-stack-template/ui/components/button"
import { useNavigate } from "@tanstack/react-router"

import {
  ERROR_CONFIG,
  type ErrorStatus,
} from "@/lib/errors"

export interface ErrorPageProps {
  code: ErrorStatus
  /** 覆盖 ERROR_CONFIG 中的标题 */
  title?: string
  /** 覆盖 ERROR_CONFIG 中的描述 */
  description?: string
  /** 自定义按钮组；不传则渲染默认的"返回上页 + 回到首页" */
  actions?: React.ReactNode
}

/**
 * 通用错误页面，所有错误码共用。
 * 默认按钮：返回上页 + 回到首页。
 */
export function ErrorPage({
  code,
  title,
  description,
  actions,
}: ErrorPageProps) {
  const config = ERROR_CONFIG[code]
  const navigate = useNavigate()

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">
          {code}
        </h1>
        <span className="font-medium">
          {title ?? config?.title ?? String(code)}
        </span>
        <p className="text-center text-muted-foreground">
          {description ?? config?.description ?? "发生未知错误，请稍后重试。"}
        </p>
        <div className="mt-6 flex gap-4">
          {actions ?? (
            <>
              <Button
                variant="outline"
                onClick={() => window.history.go(-1)}
              >
                返回上页
              </Button>
              <Button
                onClick={() =>
                  navigate({ to: "/" })
                }
              >
                回到首页
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}