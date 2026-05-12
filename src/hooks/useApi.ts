import { useState, useEffect } from 'react'

const BASE = '/api'

export function useCategories() {
  return useFetch<Category[]>(`${BASE}/categories`)
}

export function useCategoryTerms(categoryId: number, sort = 'weight') {
  return useFetch<Term[]>(`${BASE}/categories/${categoryId}/terms?sort=${sort}`)
}

export function useSearch(query: string) {
  return useFetch<SearchTerm[]>(
    query ? `${BASE}/terms/search?q=${encodeURIComponent(query)}` : null
  )
}

export function useStats() {
  return useFetch<{ terms: number; categories: number; combos: number }>(`${BASE}/stats`)
}

function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        if (!cancelled) {
          setData(json.data)
          setLoading(false)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return { data, loading, error }
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

export async function saveCombo(payload: {
  title: string
  selected_terms: number[]
  final_prompt: string
}) {
  const res = await fetch(`${BASE}/combos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function deleteCombo(id: number) {
  const res = await fetch(`${BASE}/combos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchCombos() {
  const res = await fetch(`${BASE}/combos`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.data
}
