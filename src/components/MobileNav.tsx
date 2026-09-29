'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Закрываем меню при переходе на другую страницу
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        className="w-10 h-10 rounded-xl2 border border-graphite/10 bg-white flex items-center justify-center hover:bg-sand/30 transition-colors"
      >
        <svg className="w-5 h-5 text-graphite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute left-0 right-0 top-16 bg-white border-b border-black/5 shadow-lg"
        >
          <div className="container py-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`py-3 text-base font-medium border-b border-black/5 last:border-0 transition-colors ${
                  pathname === l.href ? 'text-moss' : 'text-graphite hover:text-moss'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
