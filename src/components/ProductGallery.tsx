'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({
  images,
  title
}: {
  images: { url: string; alt?: string | null }[]
  title: string
}) {
  const list = images.length > 0 ? images : [{ url: '/images/background.jpg', alt: title }]
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = list[active] ?? list[0]

  return (
    <div className="space-y-3 self-start">
      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="aspect-4-3 relative bg-sand/20 overflow-hidden w-full cursor-zoom-in block"
          aria-label="Увеличить фото"
        >
          <Image
            src={current.url}
            alt={current.alt || title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain"
            priority={active === 0}
          />
        </button>
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              aria-current={i === active}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? 'border-moss' : 'border-transparent hover:border-graphite/30'
              }`}
            >
              <Image src={img.url} alt={img.alt || `${title}, фото ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className="relative w-full h-full max-w-5xl">
            <Image src={current.url} alt={current.alt || title} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
