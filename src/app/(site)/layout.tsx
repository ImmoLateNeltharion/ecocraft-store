import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Витрина: шапка и подвал. Админка живёт в /admin со своим layout.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
