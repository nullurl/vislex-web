import { useEffect, useState } from 'react'

const DATA_URL = '/data/vislex.json'
const COMBOS_STORAGE_KEY = 'vislex:combos'
const COMBOS_UPDATED_EVENT = 'vislex:combos-updated'

type Dataset = {
  categories: Category[]
  terms: Term[]
}

interface SavedCombo {
  id: number
  title: string
  selected_terms: number[]
  final_prompt: string
  created_at: string
}

let datasetPromise: Promise<Dataset> | null = null

function getDataset() {
  if (!datasetPromise) {
    datasetPromise = fetch(DATA_URL).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
  }
  return datasetPromise
}

function readCombos(): SavedCombo[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(COMBOS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCombos(combos: SavedCombo[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(combos))
  window.dispatchEvent(new CustomEvent(COMBOS_UPDATED_EVENT))
}

export function useCategories() {
  return useDatasetResource<Category[]>((dataset) => dataset.categories)
}

export function useCategoryTerms(categoryId: number, sort = 'weight') {
  return useDatasetResource<Term[]>((dataset) => {
    const terms = dataset.terms.filter((term) => term.category_id === categoryId)
    return [...terms].sort((a, b) =>
      sort === 'alpha'
        ? a.keyword_en.localeCompare(b.keyword_en)
        : b.weight - a.weight || a.keyword_en.localeCompare(b.keyword_en)
    )
  }, [categoryId, sort])
}

export function useSearch(query: string) {
  return useDatasetResource<SearchTerm[]>((dataset) => {
    if (!query.trim()) return []

    const q = query.trim().toLowerCase()
    const categoryMap = new Map(dataset.categories.map((category) => [category.id, category]))

    return dataset.terms
      .filter((term) => {
        const haystacks = [
          term.keyword_en.toLowerCase(),
          term.keyword_zh,
          term.description.toLowerCase(),
          term.tags.join(' ').toLowerCase(),
        ]
        return haystacks.some((value) => value.includes(q))
      })
      .sort((a, b) => b.weight - a.weight || a.keyword_en.localeCompare(b.keyword_en))
      .slice(0, 60)
      .map((term) => {
        const category = categoryMap.get(term.category_id)
        return {
          ...term,
          category_name_zh: category?.name_zh ?? '',
          category_name_en: category?.name_en ?? '',
          category_icon: category?.icon ?? '',
        }
      })
  }, [query])
}

export function useStats() {
  const [comboCount, setComboCount] = useState(() => readCombos().length)
  const resource = useDatasetResource<{ terms: number; categories: number; combos: number }>(
    (dataset) => ({
      terms: dataset.terms.length,
      categories: dataset.categories.length,
      combos: comboCount,
    }),
    [comboCount]
  )

  useEffect(() => {
    function handleCombosChanged() {
      setComboCount(readCombos().length)
    }

    window.addEventListener(COMBOS_UPDATED_EVENT, handleCombosChanged)
    window.addEventListener('storage', handleCombosChanged)

    return () => {
      window.removeEventListener(COMBOS_UPDATED_EVENT, handleCombosChanged)
      window.removeEventListener('storage', handleCombosChanged)
    }
  }, [])

  return resource
}

function useDatasetResource<T>(select: (dataset: Dataset) => T, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getDataset()
      .then((dataset) => {
        if (cancelled) return
        setData(select(dataset))
        setLoading(false)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setError(e.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, deps)

  return { data, loading, error }
}

export async function saveCombo(payload: {
  title: string
  selected_terms: number[]
  final_prompt: string
}) {
  const combos = readCombos()
  const newCombo: SavedCombo = {
    id: Date.now(),
    title: payload.title,
    selected_terms: payload.selected_terms,
    final_prompt: payload.final_prompt,
    created_at: new Date().toISOString(),
  }
  writeCombos([newCombo, ...combos])
  return { data: { id: newCombo.id } }
}

export async function deleteCombo(id: number) {
  const filtered = readCombos().filter((combo) => combo.id !== id)
  writeCombos(filtered)
  return { success: true }
}

export async function fetchCombos() {
  return readCombos().sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export interface Category {
  id: number
  name_zh: string
  name_en: string
  icon: string
  description: string
  sort_order: number
  created_at: string
}

export interface Term {
  id: number
  category_id: number
  keyword_en: string
  keyword_zh: string
  description: string
  tags: string[]
  example_prompt: string
  weight: number
  created_at: string
}

export interface SearchTerm extends Term {
  category_name_zh: string
  category_name_en: string
  category_icon: string
}
