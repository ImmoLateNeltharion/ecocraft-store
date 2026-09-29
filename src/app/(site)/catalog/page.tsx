import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Filters'
import { Material, Prisma, Warmth } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Каталог',
  description: 'Одеяла, пледы и шоперы ручной работы из льна, крапивы, муслина и фланели. Фильтры по категории, материалу и теплоте.'
}

interface SearchParams {
  category?: string
  material?: string
  warmth?: string
  sort?: string
}

function isValidMaterial(value: string): value is Material {
  // В каталоге фильтруем только по экологичным материалам
  return ['LINEN', 'RECYCLED', 'NETTLE', 'MUSLIN', 'FLANNEL', 'TENCEL'].includes(value)
}

function isValidWarmth(value: string): value is Warmth {
  return ['LIGHT', 'MEDIUM', 'WARM'].includes(value)
}

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  title: { title: 'asc' }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const categories = await prisma.productCategory.findMany({ orderBy: { order: 'asc' } })
  const activeCategory = categories.find((c) => c.id === searchParams.category)

  const where: Prisma.ProductWhereInput = {}

  if (activeCategory) {
    where.category = activeCategory.id
  }

  if (searchParams.material && isValidMaterial(searchParams.material)) {
    where.materials = { has: searchParams.material }
  }

  if (searchParams.warmth && isValidWarmth(searchParams.warmth)) {
    where.warmth = searchParams.warmth
  }

  const orderBy = SORTS[searchParams.sort ?? ''] ?? { createdAt: 'desc' as const }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { images: true, sizes: { select: { inStock: true } } }
  })

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif text-graphite">
          {activeCategory ? activeCategory.name : 'Каталог изделий'}
        </h1>
        <p className="text-graphite/70 max-w-3xl">
          Одеяла и шоперы ручной работы из натуральных экологичных материалов.
          Каждое изделие уникально и создано с любовью к природе и традициям.
        </p>
      </div>

      {/* Фильтры */}
      <div className="card p-4">
        <Filters categories={categories} />
      </div>

      {/* Результаты */}
      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-graphite/70">
            По выбранным фильтрам ничего не найдено. Попробуйте изменить параметры поиска.
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-graphite/60">
            Найдено товаров: {products.length}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                subtitle={p.subtitle}
                price={p.price}
                image={p.images[0]?.url ?? '/images/background.jpg'}
                materials={p.materials}
                inStock={p.sizes.length === 0 || p.sizes.some((s) => s.inStock > 0)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
