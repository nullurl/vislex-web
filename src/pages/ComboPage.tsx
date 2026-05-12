import { useState, useEffect } from 'react'
import { useCombo } from '../store/comboStore'
import { saveCombo, deleteCombo, fetchCombos } from '../hooks/useApi'

interface SavedCombo {
  id: number
  title: string
  selected_terms: number[]
  final_prompt: string
  created_at: string
}

interface Props {
  onBack: () => void
}

export default function ComboPage({ onBack }: Props) {
  const { selected, removeTerm, clearAll, buildPrompt } = useCombo()
  const [copied, setCopied] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedCombos, setSavedCombos] = useState<SavedCombo[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [combosCopied, setCombosCopied] = useState<Record<number, boolean>>({})

  const prompt = buildPrompt()

  useEffect(() => {
    fetchCombos()
      .then(setSavedCombos)
      .finally(() => setLoadingHistory(false))
  }, [])

  async function copyPrompt() {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleSave() {
    if (!prompt || !title.trim()) return
    setSaving(true)
    try {
      await saveCombo({
        title: title.trim(),
        selected_terms: selected.map((t) => t.id),
        final_prompt: prompt,
      })
      setTitle('')
      const updated = await fetchCombos()
      setSavedCombos(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await deleteCombo(id)
    setSavedCombos((prev) => prev.filter((c) => c.id !== id))
  }

  async function copyComboPrompt(c: SavedCombo) {
    await navigator.clipboard.writeText(c.final_prompt)
    setCombosCopied((prev) => ({ ...prev, [c.id]: true }))
    setTimeout(() => setCombosCopied((prev) => ({ ...prev, [c.id]: false })), 1500)
  }

  // Group selected terms by category
  const grouped = selected.reduce<Record<string, typeof selected>>((acc, t) => {
    const key = t.category_name_zh || '其他'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted mb-6">
        <button onClick={onBack} className="hover:text-gold transition-colors">首页</button>
        <span>/</span>
        <span className="text-ink-secondary">Prompt 组合器</span>
      </div>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink-primary tracking-tight mb-1">Prompt 组合器</h1>
          <p className="text-ink-muted text-sm">将词条组合成完整的生图 Prompt</p>
        </div>
        {selected.length > 0 && (
          <button onClick={clearAll} className="text-xs text-ink-muted hover:text-red-400 transition-colors border border-surface-3 hover:border-red-500/30 px-3 py-1.5 rounded-lg">
            清空全部
          </button>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4 opacity-20">◒</div>
          <p className="text-ink-muted text-sm mb-2">还没有选择任何词条</p>
          <p className="text-ink-muted text-xs">浏览分类，点击「+ 加入组合器」开始构建 Prompt</p>
          <button onClick={onBack} className="mt-6 btn-ghost text-xs">
            去浏览词条 →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected terms by group */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-ink-primary mb-4 flex items-center gap-2">
              <span className="text-gold">◈</span>
              已选词条
              <span className="ml-1 text-xs text-ink-muted">({selected.length} 个)</span>
            </h2>
            <div className="space-y-4">
              {Object.entries(grouped).map(([catName, terms]) => (
                <div key={catName}>
                  <p className="text-[11px] text-ink-muted mb-2 uppercase tracking-wider">{catName}</p>
                  <div className="flex flex-wrap gap-2">
                    {terms.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-1.5 bg-surface-3 border border-gold/20 rounded-lg px-3 py-1.5"
                      >
                        <span className="font-mono text-gold text-xs">{t.keyword_en}</span>
                        <span className="text-ink-muted text-[10px]">{t.keyword_zh}</span>
                        <button
                          onClick={() => removeTerm(t.id)}
                          className="ml-1 text-ink-muted hover:text-red-400 transition-colors text-xs leading-none"
                          title="移除"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated prompt */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-ink-primary flex items-center gap-2">
                <span className="text-gold">◐</span>
                生成的 Prompt
              </h2>
              <button
                onClick={copyPrompt}
                className="text-xs px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
              >
                {copied ? '✓ 已复制' : '一键复制'}
              </button>
            </div>
            <div className="prompt-block min-h-[60px]">{prompt}</div>
            <p className="mt-2 text-[11px] text-ink-muted">
              词条按权重排序 · 直接粘贴至 Midjourney / Stable Diffusion / DALL·E
            </p>
          </div>

          {/* Save combo */}
          <div className="card p-5">
            <h2 className="text-sm font-medium text-ink-primary mb-3 flex items-center gap-2">
              <span className="text-gold">◑</span>
              保存组合
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="为这个组合起个名字..."
                className="input flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={saving || !title.trim() || !prompt}
                className="btn-primary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved history */}
      <div className="mt-10">
        <div className="divider mb-6" />
        <h2 className="font-serif text-xl text-ink-primary mb-4 flex items-center gap-2">
          <span className="text-gold text-sm">◒</span>
          历史组合
        </h2>

        {loadingHistory ? (
          <div className="text-ink-muted text-sm py-4">加载中...</div>
        ) : savedCombos.length === 0 ? (
          <div className="text-ink-muted text-sm py-4 text-center">暂无保存的组合</div>
        ) : (
          <div className="space-y-3">
            {savedCombos.map((c) => (
              <div key={c.id} className="card p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium text-ink-primary">{c.title}</span>
                    <span className="ml-2 text-[11px] text-ink-muted">
                      {new Date(c.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyComboPrompt(c)}
                      className="text-[11px] text-gold/70 hover:text-gold transition-colors border border-gold/20 px-2 py-1 rounded"
                    >
                      {combosCopied[c.id] ? '✓' : '复制'}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[11px] text-ink-muted hover:text-red-400 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="prompt-block text-[11px]">{c.final_prompt}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
