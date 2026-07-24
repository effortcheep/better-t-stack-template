interface ImportMetaEnv {
  VITE_SERVER_URL?: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}