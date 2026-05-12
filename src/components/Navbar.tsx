import { useState } from 'react'
import { useCombo } from '../store/comboStore'

interface Props {
  currentPage: string
  onNavigateHome: () => void
  onNavigateCombo: () => void
  onSearch: (q: string) => void
}

export default function Navbar({ currentPage, onNavigateHome, onNavigateCombo, onSearch }: Props) {
  const [q, setQ] = useState('')
  const { selected } = useCombo()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) {
      onSearch(q.trim())
      setQ('')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surface-2 bg-surface-0/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 shrink-0 group"
        >
          <span className="text-gold text-lg font-serif">◈</span>
          <span className="font-serif text-ink-primary text-base tracking-wide group-hover:text-gold transition-colors">
            VisLex
          </span>
          <span className="hidden sm:block text-ink-muted text-xs mt-px">AI 生图词典</span>
        </button>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索词条... (英文 / 中文 / 标签)"
              className="input pr-10 text-sm h-9"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-gold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Combo button */}
        <button
          onClick={onNavigateCombo}
          className={`flex items-center gap-1.5 shrink-0 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            currentPage === 'combo'
              ? 'bg-gold/10 border-gold/30 text-gold'
              : 'border-surface-3 text-ink-secondary hover:border-gold/30 hover:text-gold'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="hidden sm:inline">组合器</span>
          {selected.length > 0 && (
            <span className="ml-0.5 bg-gold text-surface-0 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {selected.length > 9 ? '9+' : selected.length}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
