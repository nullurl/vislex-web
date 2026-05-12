import type { FastifyInstance } from 'fastify'
import { getDb } from './db.js'

export async function registerRoutes(app: FastifyInstance) {
  const db = getDb()

  // GET /api/categories
  app.get('/api/categories', async () => {
    const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order').all()
    return { data: rows }
  })

  // GET /api/categories/:id/terms
  app.get<{ Params: { id: string }; Querystring: { sort?: string } }>(
    '/api/categories/:id/terms',
    async (req) => {
      const { id } = req.params
      const { sort = 'weight' } = req.query
      const orderCol = sort === 'alpha' ? 'keyword_en' : 'weight DESC, keyword_en'
      const rows = db
        .prepare(`SELECT * FROM terms WHERE category_id = ? ORDER BY ${orderCol}`)
        .all(id)
      const parsed = rows.map((r: any) => ({ ...r, tags: JSON.parse(r.tags || '[]') }))
      return { data: parsed }
    }
  )

  // GET /api/terms/search?q=xxx
  app.get<{ Querystring: { q: string } }>('/api/terms/search', async (req) => {
    const { q } = req.query
    if (!q || q.trim().length === 0) return { data: [] }
    const like = `%${q.trim()}%`
    const rows = db
      .prepare(
        `SELECT t.*, c.name_zh as category_name_zh, c.name_en as category_name_en, c.icon as category_icon
         FROM terms t
         JOIN categories c ON t.category_id = c.id
         WHERE t.keyword_en LIKE ? OR t.keyword_zh LIKE ? OR t.description LIKE ? OR t.tags LIKE ?
         ORDER BY t.weight DESC LIMIT 60`
      )
      .all(like, like, like, like)
    const parsed = rows.map((r: any) => ({ ...r, tags: JSON.parse(r.tags || '[]') }))
    return { data: parsed }
  })

  // GET /api/terms/:id
  app.get<{ Params: { id: string } }>('/api/terms/:id', async (req) => {
    const row = db.prepare('SELECT * FROM terms WHERE id = ?').get(req.params.id) as any
    if (!row) return app.httpErrors?.notFound('Term not found') ?? { error: 'Not found' }
    return { data: { ...row, tags: JSON.parse(row.tags || '[]') } }
  })

  // GET /api/combos
  app.get('/api/combos', async () => {
    const rows = db.prepare('SELECT * FROM combos ORDER BY created_at DESC LIMIT 50').all()
    const parsed = rows.map((r: any) => ({
      ...r,
      selected_terms: JSON.parse(r.selected_terms || '[]'),
    }))
    return { data: parsed }
  })

  // POST /api/combos
  app.post<{ Body: { title: string; selected_terms: number[]; final_prompt: string } }>(
    '/api/combos',
    async (req) => {
      const { title, selected_terms, final_prompt } = req.body
      const result = db
        .prepare(
          'INSERT INTO combos (title, selected_terms, final_prompt) VALUES (?, ?, ?)'
        )
        .run(title, JSON.stringify(selected_terms), final_prompt)
      return { data: { id: result.lastInsertRowid } }
    }
  )

  // DELETE /api/combos/:id
  app.delete<{ Params: { id: string } }>('/api/combos/:id', async (req) => {
    db.prepare('DELETE FROM combos WHERE id = ?').run(req.params.id)
    return { success: true }
  })

  // GET /api/stats
  app.get('/api/stats', async () => {
    const termCount = (db.prepare('SELECT COUNT(*) as cnt FROM terms').get() as any).cnt
    const catCount = (db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as any).cnt
    const comboCount = (db.prepare('SELECT COUNT(*) as cnt FROM combos').get() as any).cnt
    return { data: { terms: termCount, categories: catCount, combos: comboCount } }
  })
}
