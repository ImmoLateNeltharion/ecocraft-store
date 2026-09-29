import Link from 'next/link'
import Image from 'next/image'
import { getCart } from '@/lib/cart'
import { SITE } from '@/lib/site'
import MobileNav from './MobileNav'

export const NAV_LINKS = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/about', label: 'О нас' },
  { href: '/contact', label: 'Контакты' }
]

export default async function Header() {
  const cart = await getCart()
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Логотип */}
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-3 min-w-0">
            <Image
              src="/images/logo.jpg"
              alt={SITE.name}
              width={40}
              height={40}
              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-lg sm:text-xl font-serif text-graphite font-bold whitespace-nowrap truncate">
              {SITE.name}
            </span>
          </Link>

          {/* Навигация (десктоп) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-graphite hover:text-moss transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Корзина */}
            <Link href="/cart" className="btn btn-secondary relative px-3 sm:px-5" aria-label="Корзина">
              <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Корзина</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-moss text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Бургер (мобильные) */}
            <MobileNav links={NAV_LINKS} />
          </div>
        </div>
      </div>
    </header>
  )
}
