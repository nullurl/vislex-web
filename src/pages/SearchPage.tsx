import { useState, useEffect } from 'react'
import { useSearch, type Category } from '../hooks/useApi'
import TermCard from '../components/TermCard'
import LoadingSpinner from '../components/LoadingSpinner'

interface Props {
  query: string
  initialQuery: string
  onSearch: (q: string) => void
  onCategoryClick: (cat: Category) => void
  onBack: () => void
}

export default function SearchPage({ query, onSearch, onBack }: Props) {
  const [inputVal, setInputVal] = useState(query)
  const { data: results, loading } = useSearch(query)

  useEffect(() => {
    setInputVal(query)
  }, [query])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputVal.trim()) onSearch(inputVal.trim())
  }

  // Group by category
  const grouped = results
    ? results.reduce<Record<string, typeof results>>((acc, term) => {
        const key = term.category_name_zh || 'Unknown'
        if (!acc[key]) acc[key] = []
        acc[key].push(term)
        return acc
      }, {})
    : {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-6">
        <button onClick={onBack} className="hover:text-gold transition-colors">首页</button>
        <span>/</span>
        <span className="text-ink-secondary">搜索结果</span>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-lg">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="重新搜索..."
            className="input h-11 pr-12"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-gold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner text={`搜索「${query}」中...`} />
      ) : results && results.length > 0 ? (
        <div>
          <p className="text-ink-muted text-sm mb-6">
            「<span className="text-gold">{query}</span>」共找到{' '}
            <span className="text-gold">{results.length}</span> 个词条
          </p>

          {Object.entries(grouped).map(([catName, terms]) => (
            <div key={catName} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gold text-base">{terms[0].category_icon}</span>
                <h2 className="font-serif text-lg text-ink-primary">{catName}</h2>
                <span className="text-xs text-ink-muted">{terms.length} 个</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {terms.map((term) => (
                  <TermCard key={term.id} term={term} showCategory={false} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 opacity-30">◈</div>
          <p className="text-ink-muted text-sm">
            未找到与「<span className="text-gold">{query}</span>」匹配的词条
          </p>
          <p className="text-ink-muted text-xs mt-2">试试其他关键词，或直接浏览分类</p>
        </div>
      )}
    </div>
  )
}
