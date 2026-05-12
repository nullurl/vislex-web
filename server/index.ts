import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyCors from '@fastify/cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { registerRoutes } from './routes.js'
import { getDb } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: { level: 'info' } })

// CORS for dev
await app.register(fastifyCors, { origin: true })

// API routes
await registerRoutes(app)

// Serve built frontend (production)
const distPath = path.join(__dirname, '..', 'dist')
try {
  await app.register(fastifyStatic, {
    root: distPath,
    prefix: '/',
  })

  // SPA fallback — serve index.html for any non-API route
  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith('/api')) {
      reply.code(404).send({ error: 'Not found' })
    } else {
      return reply.sendFile('index.html')
    }
  })
} catch {
  app.log.warn('dist/ not found — run `npm run build` for production mode')
}

const PORT = Number(process.env.PORT) || 3458
const HOST = process.env.HOST || '0.0.0.0'

try {
  // Ensure DB is ready
  getDb()
  await app.listen({ port: PORT, host: HOST })
  console.log(`\n🎨 VisLex running at http://localhost:${PORT}\n`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
