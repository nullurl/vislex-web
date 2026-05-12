import { useState } from 'react'
import { useCategories, useStats, type Category } from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

interface Props {
  onCategoryClick: (cat: Category) => void
  onSearch: (q: string) => void
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Visual Concept': '世界观 · 氛围 · 风格概念',
  'Material': '质感 · 光泽 · 表面特征',
  'Camera Angle': '镜头 · 构图 · 视角',
  'Lighting': '光影 · 色温 · 情绪基调',
  'Art Style': '绘画 · 设计 · 表现形式',
  'Anime Style': '日式动漫 · 流派 · 画风',
}

export default function HomePage({ onCategoryClick, onSearch }: Props) {
  const { data: categories, loading } = useCategories()
  const { data: stats } = useStats()
  const [q, setQ] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) onSearch(q.trim())
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-gold text-3xl font-serif">◈</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink-primary mb-3 tracking-tight">
          VisLex
        </h1>
        <p className="text-ink-secondary text-base mb-1">AI 生图参数视觉词典</p>
        <p className="text-ink-muted text-sm mb-8">
          探索 {stats ? stats.terms : '120+'} 个精选词条，构建你的完美 Prompt
        </p>

        {/* Hero search */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索任意词条，如 &quot;cinematic&quot; 或 &quot;霓虹&quot;..."
              className="input h-12 pr-12 text-base"
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
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="flex items-center justify-center gap-6 mb-12 text-xs text-ink-muted">
          <span><span className="text-gold font-medium">{stats.categories}</span> 大分类</span>
          <span className="gold-dot" />
          <span><span className="text-gold font-medium">{stats.terms}</span> 个词条</span>
          <span className="gold-dot" />
          <span><span className="text-gold font-medium">{stats.combos}</span> 个组合</span>
        </div>
      )}

      {/* Categories grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat)}
              className="card-hover p-6 text-left group flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{cat.icon}</span>
                <svg
                  className="w-4 h-4 text-ink-muted group-hover:text-gold transition-colors -translate-x-1 group-hover:translate-x-0 duration-200"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-lg text-ink-primary group-hover:text-gold transition-colors tracking-tight">
                  {cat.name_zh}
                </h2>
                <p className="text-xs text-gold/70 font-mono mt-0.5">{cat.name_en}</p>
              </div>
              <p className="text-ink-muted text-xs leading-relaxed">
                {CATEGORY_DESCRIPTIONS[cat.name_en] ?? cat.description}
              </p>
              <div className="mt-auto pt-2 border-t border-surface-3">
                <p className="text-[11px] text-ink-muted">{cat.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick tips */}
      <div className="mt-16 p-6 card border-gold/10">
        <h3 className="text-sm font-medium text-ink-primary mb-4 flex items-center gap-2">
          <span className="text-gold">◐</span> 使用指南
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ink-secondary">
          <div className="flex gap-3">
            <span className="text-gold shrink-0 mt-px">①</span>
            <p>浏览六大分类，每类收录 15-20 个精选词条，附中文说明与示例 Prompt</p>
          </div>
          <div className="flex gap-3">
            <span className="text-gold shrink-0 mt-px">②</span>
            <p>点击「+ 加入组合器」将感兴趣的词条加入，跨分类多选</p>
          </div>
          <div className="flex gap-3">
            <span className="text-gold shrink-0 mt-px">③</span>
            <p>在「组合器」页面预览完整 Prompt，一键复制并保存你的组合</p>
          </div>
        </div>
      </div>
    </div>
  )
}
