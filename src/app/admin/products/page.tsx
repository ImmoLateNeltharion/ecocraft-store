import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const isAuth = await checkAdminAuth()
  
  if (!isAuth) {
    redirect('/admin/login')
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      images: true,
      sizes: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-graphite">Товары</h2>
        <Link href="/admin/products/new" className="btn btn-primary">
          + Добавить товар
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-graphite/60 mb-4">Товаров пока нет</p>
          <Link href="/admin/products/new" className="btn btn-primary">
            Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="card overflow-hidden group">
              {/* Изображение */}
              <div className="relative aspect-[4/3] bg-sand">
                {product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-graphite/30">
                    Нет фото
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-graphite mb-1">{product.title}</h3>
                  {product.subtitle && (
                    <p className="text-sm text-graphite/60">{product.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-moss">{formatPrice(product.price)}</span>
                  <span className="text-sm text-graphite/60">
                    {product.sizes.reduce((sum, s) => sum + s.inStock, 0)} шт.
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="btn btn-secondary flex-1 text-center"
                  >
                    Редактировать
                  </Link>
                  <Link
                    href={`/product/${product.slug}`}
                    target="_blank"
                    className="btn btn-secondary px-4"
                    title="Открыть на сайте"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

