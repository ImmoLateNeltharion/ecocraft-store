import { redirect } from 'next/navigation'
import { checkAdminAuth, clearAdminSession } from '@/lib/auth'
import { ReactNode } from 'react'

async function logoutAction() {
  'use server'
  await clearAdminSession()
  redirect('/admin/login')
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const isAuth = await checkAdminAuth()
  
  // Если не авторизован и не на странице логина - редирект
  if (!isAuth) {
    return children // Пусть страница логина сама решает
  }

  return (
    <div className="min-h-screen bg-sand/30">
      {/* Шапка админки */}
      <header className="bg-white border-b border-graphite/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-graphite">
                Админ панель
              </h1>
              <p className="text-sm text-graphite/60">Долина снов Аниэль</p>
            </div>
            
            <nav className="flex items-center gap-4">
              <a href="/admin" className="text-sm hover:text-moss transition">
                Главная
              </a>
              <a href="/admin/orders" className="text-sm hover:text-moss transition">
                Заказы
              </a>
              <a href="/admin/products" className="text-sm hover:text-moss transition">
                Товары
              </a>
              <form action={logoutAction}>
                <button type="submit" className="text-sm text-red-600 hover:text-red-700">
                  Выход
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

