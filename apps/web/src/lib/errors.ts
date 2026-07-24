/** 各错误码对应的标题和描述 */
export const ERROR_CONFIG: Record<
  number,
  { title: string; description: string }
> = {
  401: {
    title: "未登录",
    description: "请先登录后再访问此页面。",
  },
  403: {
    title: "访问受限",
    description: "您没有访问此资源的权限。",
  },
  404: {
    title: "页面不存在",
    description: "您访问的页面不存在或已被移除。",
  },
  500: {
    title: "服务器错误",
    description: "服务器出了点问题，请稍后重试。",
  },
  503: {
    title: "服务不可用",
    description: "服务暂时不可用，请稍后重试。",
  },
}

/** 可识别的 HTTP 错误码 */
export type ErrorStatus = 401 | 403 | 404 | 500 | 503

/**
 * 应用级错误，携带 HTTP 状态码供 errorComponent 分支渲染。
 * 在 beforeLoad / loader / 组件中 throw 即可触发对应错误页。
 */
export class AppError extends Error {
  /**
   * @param status    HTTP 错误码
   * @param description  覆盖 ERROR_CONFIG 中的描述
   * @param title       覆盖 ERROR_CONFIG 中的标题；同时作为 Error.message
   */
  constructor(
    public readonly status: ErrorStatus,
    description?: string,
    title?: string,
  ) {
    const resolvedTitle =
      title ?? ERROR_CONFIG[status]?.title ?? "未知错误"
    super(resolvedTitle)
    this.name = "AppError"
    this._title = resolvedTitle
    this._description =
      description ??
      ERROR_CONFIG[status]?.description ??
      ""
  }

  private readonly _title: string

  private readonly _description: string

  /** 错误标题（对应页面大字下方的标题行） */
  get title(): string {
    return this._title
  }

  /** 错误描述（对应页面的说明文案） */
  get description(): string {
    return this._description
  }
}