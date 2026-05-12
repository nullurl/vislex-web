import { useState } from 'react'
import type { Term, SearchTerm } from '../hooks/useApi'
import { useCombo } from '../store/comboStore'

interface Props {
  term: Term | SearchTerm
  showCategory?: boolean
}

export default function TermCard({ term, showCategory = false }: Props) {
  const { addTerm, removeTerm, hasTerm } = useCombo()
  const [copied, setCopied] = useState(false)
  const [promptVisible, setPromptVisible] = useState(false)
  const isSelected = hasTerm(term.id)

  const st = term as SearchTerm

  function toggleSelect() {
    if (isSelected) {
      removeTerm(term.id)
    } else {
      addTerm({
        id: term.id,
        keyword_en: term.keyword_en,
        keyword_zh: term.keyword_zh,
        category_name_en: st.category_name_en ?? '',
        category_name_zh: st.category_name_zh ?? '',
        weight: term.weight,
      })
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(term.example_prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const weightDots = Math.min(term.weight, 5)

  return (
    <div
      className={`card p-4 flex flex-col gap-3 transition-all duration-200 ${
        isSelected
          ? 'border-gold/40 bg-surface-3 ring-gold-glow'
          : 'card-hover'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-gold text-sm font-medium tracking-wide">
              {term.keyword_en}
            </span>
            <span className="text-ink-secondary text-xs">{term.keyword_zh}</span>
          </div>
          {showCategory && st.category_name_zh && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted">
              <span>{st.category_icon}</span>
              <span>{st.category_name_zh}</span>
            </div>
          )}
        </div>

        {/* Weight dots */}
        <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < weightDots ? 'bg-gold' : 'bg-surface-4'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-ink-secondary text-xs leading-relaxed line-clamp-3">
        {term.description}
      </p>

      {/* Tags */}
      {term.tags && term.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {term.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* Example prompt toggle */}
      {term.example_prompt && (
        <div>
          <button
            onClick={() => setPromptVisible(!promptVisible)}
            className="text-[11px] text-ink-muted hover:text-gold transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${promptVisible ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            示例 Prompt
          </button>
          {promptVisible && (
            <div className="mt-2 relative group/prompt">
              <div className="prompt-block">{term.example_prompt}</div>
              <button
                onClick={copyPrompt}
                className="absolute top-2 right-2 opacity-0 group-hover/prompt:opacity-100
                           text-[10px] text-gold/70 hover:text-gold transition-all px-1.5 py-0.5
                           bg-surface-0/80 rounded border border-gold/20"
              >
                {copied ? '✓' : '复制'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add to combo */}
      <button
        onClick={toggleSelect}
        className={`mt-auto self-start text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
          isSelected
            ? 'bg-gold/15 border-gold/40 text-gold hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-400'
            : 'border-surface-3 text-ink-muted hover:border-gold/30 hover:text-gold'
        }`}
      >
        {isSelected ? '✓ 已添加 · 点击移除' : '+ 加入组合器'}
      </button>
    </div>
  )
}
