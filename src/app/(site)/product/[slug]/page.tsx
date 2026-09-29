import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/currency'
import Badge from '@/components/Badge'
import ProductGallery from '@/components/ProductGallery'
import AddToCartForm from './AddToCartForm'
import { ECO_MATERIAL_KEYS, MATERIAL_LABELS } from '@/lib/materials'
import { SITE } from '@/lib/site'

const ECO_TAG_LABELS: Record<string, string> = {
  HANDMADE: 'Ручная работа',
  NATURAL_DYES: 'Натуральные красители',
  SMALL_BATCH: 'Малая партия',
  ZERO_PLASTIC_PACKAGING: 'Без пластика',
  ORGANIC: 'Органическое',
  RECYCLED_MATERIALS: 'Переработанные материалы',
  LOCAL_PRODUCTION: 'Местное производство'
}

const WARMTH_LABELS: Record<string, string> = {
  LIGHT: 'Лёгкое',
  MEDIUM: 'Среднее',
  WARM: 'Тёплое'
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { title: true, subtitle: true, description: true, images: { take: 1 } }
  })
  if (!product) return { title: 'Товар не найден' }

  const description = (product.subtitle ? product.subtitle + '. ' : '') + product.description.slice(0, 160)
  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.images[0]?.url ? [product.images[0].url] : undefined
    }
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: true,
      sizes: true,
      reviews: { orderBy: { createdAt: 'desc' } }
    }
  })

  if (!product) {
    return notFound()
  }

  const category = await prisma.productCategory.findUnique({ where: { id: product.category } })

  const readableMaterials = product.materials
    .filter((mat) => ECO_MATERIAL_KEYS.has(mat as any))
    .map((mat) => MATERIAL_LABELS[mat] || mat)

  const sizesData = product.sizes.map((s) => ({ id: s.id, label: s.label, inStock: s.inStock }))
  const inStock = product.sizes.length === 0 || product.sizes.some((s) => s.inStock > 0)

  // Разметка для поисковиков (Product / Offer)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.subtitle || product.description.slice(0, 200),
    image: product.images.map((i) => (i.url.startsWith('http') ? i.url : SITE.url + i.url)),
    brand: { '@type': 'Brand', name: SITE.name },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews.length
      }
    }),
    offers: {
      '@type': 'Offer',
      url: `${SITE.url}/product/${product.slug}`,
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  }

  return (
    <div className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Хлебные крошки */}
      <nav aria-label="Навигация" className="text-sm text-graphite/60 mb-6 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-moss">Главная</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-moss">Каталог</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/catalog?category=${category.id}`} className="hover:text-moss">{category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-graphite">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <ProductGallery images={product.images} title={product.title} />

        {/* Информация */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif text-graphite">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-lg text-graphite/70">{product.subtitle}</p>
            )}
          </div>

          {/* Цена */}
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-semibold text-moss">{formatPrice(product.price)}</span>
            {!inStock && <span className="badge bg-red-100 text-red-700">Нет в наличии</span>}
          </div>

          {/* Форма добавления в корзину */}
          <AddToCartForm productId={product.id} sizes={sizesData} />

          {/* Характеристики */}
          <div className="card p-5 space-y-3 text-sm">
            <h2 className="font-medium text-graphite">Характеристики</h2>
            {readableMaterials.length > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-graphite/60">Материалы:</span>
                <span className="font-medium text-right">{readableMaterials.join(' + ')}</span>
              </div>
            )}
            {product.sizes.length > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-graphite/60">Размеры:</span>
                <span className="font-medium text-right">{product.sizes.map((s) => s.label).join(', ')}</span>
              </div>
            )}
            {product.warmth && (
              <div className="flex justify-between gap-4">
                <span className="text-graphite/60">Теплота:</span>
                <span className="font-medium">{WARMTH_LABELS[product.warmth]}</span>
              </div>
            )}
            {product.color && (
              <div className="flex justify-between gap-4">
                <span className="text-graphite/60">Цвет:</span>
                <span className="font-medium text-right">{product.color}</span>
              </div>
            )}
            {category && (
              <div className="flex justify-between gap-4">
                <span className="text-graphite/60">Категория:</span>
                <span className="font-medium text-right">{category.name}</span>
              </div>
            )}
          </div>

          {/* Эко-бейджи */}
          {product.ecoTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.ecoTags.map((tag) => (
                <Badge key={tag}>{ECO_TAG_LABELS[tag]}</Badge>
              ))}
            </div>
          )}

          {/* Описание */}
          <div>
            <h2 className="text-lg font-medium text-graphite mb-2">Описание</h2>
            <p className="text-graphite/70 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Доставка */}
          <div className="bg-sand/30 rounded-xl p-4 text-sm text-graphite/70 space-y-1">
            <p>🚚 Доставка по России: пункты выдачи CDEK и Boxberry, курьер, Почта России.</p>
            <p>💳 Оплата онлайн через ЮKassa. Стоимость доставки согласуем после оформления.</p>
          </div>
        </div>
      </div>

      {/* Отзывы */}
      {product.reviews.length > 0 && (
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-serif text-graphite">
            Отзывы ({product.reviews.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((review) => (
              <div key={review.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-graphite">{review.author}</span>
                  <span className="text-sm text-moss" aria-label={`Оценка ${review.stars} из 5`}>{'⭐'.repeat(review.stars)}</span>
                </div>
                <p className="text-graphite/70">{review.body}</p>
                <p className="text-xs text-graphite/50">
                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
