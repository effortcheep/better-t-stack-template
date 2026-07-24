import { create } from "zustand"

/** 全局应用设置，跨 feature 共享 */
interface SettingsStore {
  /** 侧栏折叠状态 */
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  /** 主题模式 */
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  theme: "system",
  setTheme: (theme) => set({ theme }),
}))