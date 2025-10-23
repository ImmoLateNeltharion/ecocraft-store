import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Filters'
import { Category, Material, Warmth } from '@prisma/client'

interface SearchParams {
  category?: string
  material?: string
  warmth?: string
}

function isValidCategory(value: string): value is Category {
  return ['BLANKET', 'SHOPPER'].includes(value)
}

function isValidMaterial(value: string): value is Material {
  return ['LINEN', 'COTTON', 'WOOL', 'BAMBOO', 'RECYCLED', 'NETTLE', 'MUSLIN', 'FLANNEL'].includes(value)
}

function isValidWarmth(value: string): value is Warmth {
  return ['LIGHT', 'MEDIUM', 'WARM'].includes(value)
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const where: any = {}

  if (searchParams.category && isValidCategory(searchParams.category)) {
    where.category = searchParams.category
  }

  if (searchParams.material && isValidMaterial(searchParams.material)) {
    where.material = searchParams.material
  }

  if (searchParams.warmth && isValidWarmth(searchParams.warmth)) {
    where.warmth = searchParams.warmth
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  })

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-serif text-graphite">
          Каталог изделий
        </h1>
        <p className="text-graphite/70 max-w-3xl">
          Одеяла и шоперы ручной работы из натуральных экологичных материалов. 
          Каждое изделие уникально и создано с любовью к природе и традициям.
        </p>
      </div>

      {/* Фильтры */}
      <div className="card p-6">
        <h2 className="font-medium mb-4 text-graphite">Фильтры</h2>
        <Filters />
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
                material={p.material}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

