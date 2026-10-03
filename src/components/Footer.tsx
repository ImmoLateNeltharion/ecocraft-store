import Link from 'next/link'
import { SITE, legalLine } from '@/lib/site'

export default function Footer() {
  return (
    <footer className="border-t border-black/5 mt-20 py-12 bg-white/40">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* О компании */}
          <div>
            <h3 className="font-serif text-xl mb-4 text-graphite">Долина снов Анэль</h3>
            <p className="text-sm text-graphite/70 leading-relaxed">
              Одеяла и шоперы ручной работы из натуральных экологичных тканей. 
              Русское ремесленное искусство, малые партии, без пластика.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="font-medium mb-4 text-graphite">Навигация</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalog" className="text-graphite/70 hover:text-moss transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-graphite/70 hover:text-moss transition-colors">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-graphite/70 hover:text-moss transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-graphite/70 hover:text-moss transition-colors">
                  Корзина
                </Link>
              </li>
            </ul>
            <h4 className="font-medium mb-3 mt-6 text-graphite">Покупателям</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/offer" className="text-graphite/70 hover:text-moss transition-colors">
                  Публичная оферта
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-graphite/70 hover:text-moss transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Ценности */}
          <div>
            <h4 className="font-medium mb-4 text-graphite">Наши ценности</h4>
            <div className="flex flex-wrap gap-2">
              <span className="badge">Натуральные ткани</span>
              <span className="badge">Ручной пошив</span>
              <span className="badge">Без пластика</span>
              <span className="badge">Малые партии</span>
              <span className="badge">Эко-упаковка</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-black/5 text-center text-sm text-graphite/60 space-y-1">
          <div>© {new Date().getFullYear()} {SITE.name}. Все права защищены.</div>
          {legalLine() && <div className="text-xs text-graphite/50">{legalLine()}</div>}
        </div>
      </div>
    </footer>
  )
}

