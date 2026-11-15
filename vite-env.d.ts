interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_AVATAR_URL: string
  readonly VITE_SKRUNGLY_API_URL: string
  readonly VITE_BANCHOPY_API_URL: string
  readonly VITE_GITHUB_URL: string
  readonly VITE_STATUS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
