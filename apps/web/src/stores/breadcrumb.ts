import { create } from "zustand"

export interface BreadcrumbEntry {
  label: string
  href?: string
}

/** 全局面包屑导航状态，路由切换时更新 */
interface BreadcrumbStore {
  items: BreadcrumbEntry[]
  setItems: (items: BreadcrumbEntry[]) => void
  push: (item: BreadcrumbEntry) => void
  pop: () => void
  clear: () => void
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  push: (item) => set((s) => ({ items: [...s.items, item] })),
  pop: () => set((s) => ({ items: s.items.slice(0, -1) })),
  clear: () => set({ items: [] }),
}))