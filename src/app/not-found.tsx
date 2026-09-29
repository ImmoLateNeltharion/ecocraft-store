import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Корневой not-found: ловит и несуществующие URL, и notFound() из страниц.
// Шапку и подвал рендерим сами, т.к. корневой layout их не содержит.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container py-24">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <p className="text-7xl font-serif text-moss/60">404</p>
            <h1 className="text-3xl font-serif text-graphite">Страница не найдена</h1>
            <p className="text-graphite/70">
              Возможно, товар сняли с продажи или ссылка устарела.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/catalog" className="btn btn-primary">В каталог</Link>
              <Link href="/" className="btn btn-secondary">На главную</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
