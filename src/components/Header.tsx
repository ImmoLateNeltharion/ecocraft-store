import Link from 'next/link'
import { getCart } from '@/lib/cart'

export default async function Header() {
  const cart = await getCart()
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link href="/" className="font-serif text-2xl text-graphite hover:text-moss transition-colors">
            EcoCraft
          </Link>

          {/* Навигация */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/catalog" className="text-graphite hover:text-moss transition-colors">
              Каталог
            </Link>
            <Link href="/about" className="text-graphite hover:text-moss transition-colors">
              О нас
            </Link>
            <Link href="/contact" className="text-graphite hover:text-moss transition-colors">
              Контакты
            </Link>
          </nav>

          {/* Корзина */}
          <Link href="/cart" className="btn btn-secondary relative">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Корзина
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-moss text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Мобильная навигация */}
        <nav className="md:hidden flex items-center gap-6 text-sm font-medium pb-3 border-t border-black/5 pt-3 mt-1">
          <Link href="/catalog" className="text-graphite hover:text-moss transition-colors">
            Каталог
          </Link>
          <Link href="/about" className="text-graphite hover:text-moss transition-colors">
            О нас
          </Link>
          <Link href="/contact" className="text-graphite hover:text-moss transition-colors">
            Контакты
          </Link>
        </nav>
      </div>
    </header>
  )
}

