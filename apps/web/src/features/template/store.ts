import { create } from "zustand"

import type { TemplateRecord } from "./types"

interface TemplateStore {
  /** 当前选中的模板记录（供详情/编辑跨页面共享） */
  selected: TemplateRecord | null
  setSelected: (record: TemplateRecord | null) => void
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  selected: null,
  setSelected: (record) => set({ selected: record }),
}))