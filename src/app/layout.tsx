import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Долина снов Аниэль — одеяла и шоперы ручной работы из натуральных тканей',
  description: 'Одеяла ручной работы из натуральных материалов: лён, крапива, муслин, фланель. Экологичные шоперы. Русское ремесленное искусство, малые партии, без пластика.',
  keywords: 'одеяла ручной работы, льняные одеяла, экологичные товары, шоперы из льна, натуральные ткани, крапива, муслин, фланель',
  icons: {
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

