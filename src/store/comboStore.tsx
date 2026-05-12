import { createContext, useContext, useState, ReactNode } from 'react'

export interface SelectedTerm {
  id: number
  keyword_en: string
  keyword_zh: string
  category_name_en: string
  category_name_zh: string
  weight: number
}

interface ComboCtx {
  selected: SelectedTerm[]
  addTerm: (t: SelectedTerm) => void
  removeTerm: (id: number) => void
  hasTerm: (id: number) => boolean
  clearAll: () => void
  buildPrompt: () => string
}

const Ctx = createContext<ComboCtx | null>(null)

export function ComboStore({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedTerm[]>([])

  function addTerm(t: SelectedTerm) {
    setSelected((prev) => {
      if (prev.find((x) => x.id === t.id)) return prev
      return [...prev, t]
    })
  }

  function removeTerm(id: number) {
    setSelected((prev) => prev.filter((x) => x.id !== id))
  }

  function hasTerm(id: number) {
    return selected.some((x) => x.id === id)
  }

  function clearAll() {
    setSelected([])
  }

  function buildPrompt() {
    // Group by category, sort by weight desc
    const sorted = [...selected].sort((a, b) => b.weight - a.weight)
    return sorted.map((t) => t.keyword_en).join(', ')
  }

  return (
    <Ctx.Provider value={{ selected, addTerm, removeTerm, hasTerm, clearAll, buildPrompt }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCombo() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCombo must be used inside ComboStore')
  return ctx
}
