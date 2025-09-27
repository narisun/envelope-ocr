import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cleanupOldRows } from './ttl'

export type EnvelopeRow = {
  id: string
  scannedAt: string
  code: string
  name?: string
  addressRaw: string
  street?: string
  city?: string
  state?: string
  zip?: string
  confCode?: number
  confAddr?: number
  imageThumb?: string
}

type State = {
  rows: EnvelopeRow[]
  addRow: (row: EnvelopeRow) => void
  updateRow: (id: string, patch: Partial<EnvelopeRow>) => void
  deleteRow: (id: string) => void
  clearAll: () => void
}

export const useApp = create<State>()(persist(
  (set, get) => ({
    rows: [],
    addRow: (row) => set({ rows: [row, ...get().rows] }),
    updateRow: (id, patch) => set({ rows: get().rows.map(r => r.id === id ? { ...r, ...patch } : r) }),
    deleteRow: (id) => set({ rows: get().rows.filter(r => r.id !== id) }),
    clearAll: () => set({ rows: [] })
  }),
  {
    name: 'envelope-rows',
    onRehydrateStorage: () => (state) => {
      if (!state) return
      const cleaned = cleanupOldRows(state.rows ?? [], 24)
      state.rows = cleaned
    }
  }
))
