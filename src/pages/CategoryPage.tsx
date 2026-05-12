import { useState } from 'react'
import { useCategoryTerms } from '../hooks/useApi'
import TermCard from '../components/TermCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useCombo } from '../store/comboStore'

interface Props {
  categoryId: number
  nameZh: string
  nameEn: string
  icon: string
  onBack: () => void
  onNavigateCombo: () => void
}

export default function CategoryPage({
  categoryId, nameZh, nameEn, icon, onBack, onNavigateCombo,
}: Props) {
  const [sort, setSort] = useState<'weight' | 'alpha'>('weight')
  const [search, setSearch] = useState('')
  const { data: terms, loading } = useCategoryTerms(categoryId, sort)
  const { selected } = useCombo()

  const filtered = terms?.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.keyword_en.toLowerCase().includes(q) ||
      t.keyword_zh.includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
    )
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-6">
        <button onClick={onBack} className="hover:text-gold transition-colors">首页</button>
        <span>/</span>
        <span className="text-ink-secondary">{nameZh}</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="font-serif text-3xl text-ink-primary tracking-tight">{nameZh}</h1>
              <p className="text-gold/70 font-mono text-sm">{nameEn}</p>
            </div>
          </div>
          {terms && (
            <p className="text-ink-muted text-xs mt-1">
              共 <span className="text-gold">{terms.length}</span> 个词条
              {filtered && filtered.length !== terms.length && (
                <span>，筛选后 <span className="text-gold">{filtered.length}</span> 个</span>
              )}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              onClick={onNavigateCombo}
              className="btn-primary flex items-center gap-1.5 text-xs"
            >
              <span>组合器</span>
              <span className="bg-surface-0/30 text-surface-0 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {selected.length}
              </span>
            </button>
          )}
          <div className="flex border border-surface-3 rounded-lg overflow-hidden">
            <button
              onClick={() => setSort('weight')}
              className={`px-3 py-1.5 text-xs transition-colors ${
                sort === 'weight'
                  ? 'bg-surface-3 text-ink-primary'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              权重
            </button>
            <button
              onClick={() => setSort('alpha')}
              className={`px-3 py-1.5 text-xs transition-colors ${
                sort === 'alpha'
                  ? 'bg-surface-3 text-ink-primary'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              字母
            </button>
          </div>
        </div>
      </div>

      {/* Local filter */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`在 ${nameZh} 中搜索...`}
          className="input max-w-sm text-sm"
        />
      </div>

      {/* Terms grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((term) => (
            <TermCard key={term.id} term={term} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-ink-muted text-sm">
          {search ? `未找到匹配「${search}」的词条` : '暂无词条'}
        </div>
      )}
    </div>
  )
}
