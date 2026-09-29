import { redirect } from 'next/navigation'
import { checkAdminAuth, clearAdminSession } from '@/lib/auth'
import { ReactNode } from 'react'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Админ панель', robots: { index: false, follow: false } }

async function logoutAction() {
  'use server'
  await clearAdminSession()
  redirect('/admin/login')
}

const ADMIN_LINKS = [
  { href: '/admin', label: 'Главная' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/products', label: 'Товары' },
  { href: '/admin/categories', label: 'Категории' }
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const isAuth = await checkAdminAuth()

  // Не авторизован — страница логина рендерится без шапки админки
  if (!isAuth) {
    return children
  }

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Шапка админки */}
      <header className="bg-white border-b border-graphite/10 sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-serif text-graphite leading-tight">
                Админ панель
              </h1>
              <p className="text-xs md:text-sm text-graphite/60 truncate">{SITE.name}</p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {ADMIN_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-moss transition whitespace-nowrap">
                  {l.label}
                </a>
              ))}
              <a href="/" target="_blank" className="text-graphite/50 hover:text-moss transition whitespace-nowrap">
                Сайт ↗
              </a>
              <form action={logoutAction}>
                <button type="submit" className="text-red-600 hover:text-red-700 whitespace-nowrap">
                  Выход
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
