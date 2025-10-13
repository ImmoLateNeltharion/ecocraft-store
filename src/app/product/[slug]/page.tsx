import { prisma } from '@/lib/db'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { addToCart } from '@/lib/cart'
import { formatPrice } from '@/lib/currency'
import Badge from '@/components/Badge'
import { revalidatePath } from 'next/cache'
import AddToCartForm from './AddToCartForm'

const ECO_TAG_LABELS: Record<string, string> = {
  HANDMADE: 'Ручная работа',
  NATURAL_DYES: 'Натуральные красители',
  SMALL_BATCH: 'Малая партия',
  ZERO_PLASTIC_PACKAGING: 'Без пластика',
  ORGANIC: 'Органическое',
  RECYCLED_MATERIALS: 'Переработанные материалы',
  LOCAL_PRODUCTION: 'Местное производство'
}

const MATERIAL_LABELS: Record<string, string> = {
  LINEN: 'Лён',
  COTTON: 'Хлопок',
  WOOL: 'Шерсть',
  BAMBOO: 'Бамбук',
  RECYCLED: 'Переработанное',
  NETTLE: 'Крапива',
  MUSLIN: 'Муслин',
  FLANNEL: 'Фланель'
}

const WARMTH_LABELS: Record<string, string> = {
  LIGHT: 'Лёгкое',
  MEDIUM: 'Среднее',
  WARM: 'Тёплое'
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

  const productId = product.id
  const productSlug = product.slug

  async function handleAddToCart(formData: FormData) {
    'use server'
    const sizeId = formData.get('sizeId')?.toString()
    await addToCart({ productId, sizeId, qty: 1 })
    revalidatePath('/cart')
    revalidatePath(`/product/${productSlug}`)
  }

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Изображение */}
        <div className="card overflow-hidden">
          <div className="aspect-[4/3] relative bg-sand/20">
            <Image
              src={product.images[0]?.url ?? '/images/placeholder.jpg'}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

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
          <div className="text-3xl font-semibold text-moss">
            {formatPrice(product.price)}
          </div>

          {/* Характеристики */}
          <div className="card p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-graphite/60">Материал:</span>
              <span className="font-medium">{MATERIAL_LABELS[product.material]}</span>
            </div>
            {product.warmth && (
              <div className="flex justify-between">
                <span className="text-graphite/60">Теплота:</span>
                <span className="font-medium">{WARMTH_LABELS[product.warmth]}</span>
              </div>
            )}
            {product.color && (
              <div className="flex justify-between">
                <span className="text-graphite/60">Цвет:</span>
                <span className="font-medium">{product.color}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-graphite/60">Рейтинг:</span>
              <span className="font-medium">⭐ {product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Эко-бейджи */}
          {product.ecoTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-graphite/70">Экологичность:</h3>
              <div className="flex flex-wrap gap-2">
                {product.ecoTags.map((tag) => (
                  <Badge key={tag}>{ECO_TAG_LABELS[tag]}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Форма добавления в корзину */}
          <AddToCartForm action={handleAddToCart} sizes={product.sizes} />

          {/* Описание */}
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-medium text-graphite mb-2">Описание</h3>
            <p className="text-graphite/70 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Отзывы */}
      {product.reviews.length > 0 && (
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-serif text-graphite">
            Отзывы ({product.reviews.length})
          </h2>
          <div className="grid gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-graphite">{review.author}</span>
                  <span className="text-sm text-moss">{'⭐'.repeat(review.stars)}</span>
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

