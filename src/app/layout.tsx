import type { Metadata } from 'next'
import './globals.css'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — одеяла и шоперы ручной работы из натуральных тканей`,
    template: `%s — ${SITE.name}`
  },
  description: 'Одеяла ручной работы из натуральных материалов: лён, крапива, муслин, фланель. Экологичные шоперы. Русское ремесленное искусство, малые партии, без пластика.',
  keywords: 'одеяла ручной работы, льняные одеяла, экологичные товары, шоперы из льна, натуральные ткани, крапива, муслин, фланель',
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'ru_RU',
    images: ['/images/background.jpg']
  },
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
      <body>{children}</body>
    </html>
  )
}
