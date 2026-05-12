import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import ComboPage from './pages/ComboPage'
import { ComboStore } from './store/comboStore'

export type Page =
  | { name: 'home' }
  | { name: 'category'; id: number; nameZh: string; nameEn: string; icon: string }
  | { name: 'search'; query: string }
  | { name: 'combo' }

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'home' })
  const [searchQuery, setSearchQuery] = useState('')

  function navigate(p: Page) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSearch(q: string) {
    if (q.trim()) {
      setSearchQuery(q.trim())
      navigate({ name: 'search', query: q.trim() })
    }
  }

  return (
    <ComboStore>
      <div className="min-h-screen flex flex-col">
        <Navbar
          currentPage={page.name}
          onNavigateHome={() => navigate({ name: 'home' })}
          onNavigateCombo={() => navigate({ name: 'combo' })}
          onSearch={handleSearch}
        />
        <main className="flex-1 page-enter">
          {page.name === 'home' && (
            <HomePage
              onCategoryClick={(cat) =>
                navigate({
                  name: 'category',
                  id: cat.id,
                  nameZh: cat.name_zh,
                  nameEn: cat.name_en,
                  icon: cat.icon,
                })
              }
              onSearch={handleSearch}
            />
          )}
          {page.name === 'category' && (
            <CategoryPage
              categoryId={page.id}
              nameZh={page.nameZh}
              nameEn={page.nameEn}
              icon={page.icon}
              onBack={() => navigate({ name: 'home' })}
              onNavigateCombo={() => navigate({ name: 'combo' })}
            />
          )}
          {page.name === 'search' && (
            <SearchPage
              query={page.query}
              initialQuery={searchQuery}
              onSearch={handleSearch}
              onCategoryClick={(cat) =>
                navigate({
                  name: 'category',
                  id: cat.id,
                  nameZh: cat.name_zh,
                  nameEn: cat.name_en,
                  icon: cat.icon,
                })
              }
              onBack={() => navigate({ name: 'home' })}
            />
          )}
          {page.name === 'combo' && (
            <ComboPage onBack={() => navigate({ name: 'home' })} />
          )}
        </main>
        <footer className="border-t border-surface-2 py-6 text-center text-ink-muted text-xs tracking-wide">
          VisLex · AI 生图参数视觉词典 &nbsp;·&nbsp; {new Date().getFullYear()}
        </footer>
      </div>
    </ComboStore>
  )
}
