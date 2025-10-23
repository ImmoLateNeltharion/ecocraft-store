import { prisma } from '@/lib/db'
import { getCart, removeFromCart, updateCartItemQty } from '@/lib/cart'
import Link from 'next/link'
import { formatPrice } from '@/lib/currency'
import Image from 'next/image'
import { revalidatePath } from 'next/cache'

export default async function CartPage() {
  const cart = await getCart()
  const ids = cart.map((i) => i.productId)
  
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: true, sizes: true }
  })

  const items = cart.map((i) => {
    const p = products.find((p) => p.id === i.productId)!
    const size = p.sizes.find((s) => s.id === i.sizeId)
    return { p, size, qty: i.qty, sizeId: i.sizeId }
  })

  const total = items.reduce((sum, i) => sum + i.p.price * i.qty, 0)

  async function handleRemove(productId: string, sizeId?: string) {
    'use server'
    await removeFromCart(productId, sizeId)
    revalidatePath('/cart')
  }

  async function handleUpdateQty(productId: string, sizeId: string | undefined, qty: number) {
    'use server'
    await updateCartItemQty(productId, sizeId, qty)
    revalidatePath('/cart')
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl md:text-4xl font-serif text-graphite">Корзина</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <p className="text-graphite/70 text-lg">Ваша корзина пуста</p>
          <Link href="/catalog" className="btn btn-primary inline-flex">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Товары */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div key={`${item.p.id}-${item.sizeId}-${idx}`} className="card p-5">
                <div className="flex gap-4">
                  {/* Изображение */}
                  <Link 
                    href={`/product/${item.p.slug}`}
                    className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-sand/20"
                  >
                    <Image
                      src={item.p.images[0]?.url ?? '/images/background.jpg'}
                      alt={item.p.title}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Информация */}
                  <div className="flex-1 space-y-2">
                    <Link 
                      href={`/product/${item.p.slug}`}
                      className="font-medium text-graphite hover:text-moss transition-colors"
                    >
                      {item.p.title}
                    </Link>
                    {item.size && (
                      <p className="text-sm text-graphite/60">Размер: {item.size.label}</p>
                    )}
                    <p className="text-moss font-semibold">{formatPrice(item.p.price)}</p>

                    {/* Количество */}
                    <div className="flex items-center gap-3">
                      <form action={async () => {
                        'use server'
                        await handleUpdateQty(item.p.id, item.sizeId, item.qty - 1)
                      }}>
                        <button 
                          type="submit"
                          className="w-8 h-8 rounded-lg border border-graphite/20 hover:bg-sand/30 transition-colors flex items-center justify-center"
                        >
                          −
                        </button>
                      </form>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <form action={async () => {
                        'use server'
                        await handleUpdateQty(item.p.id, item.sizeId, item.qty + 1)
                      }}>
                        <button 
                          type="submit"
                          className="w-8 h-8 rounded-lg border border-graphite/20 hover:bg-sand/30 transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Удалить */}
                  <form action={async () => {
                    'use server'
                    await handleRemove(item.p.id, item.sizeId)
                  }}>
                    <button 
                      type="submit"
                      className="text-graphite/40 hover:text-red-500 transition-colors p-2"
                      title="Удалить"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Итого */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-4 sticky top-24">
              <h2 className="text-xl font-medium text-graphite">Итого</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-graphite/60">Товаров:</span>
                  <span>{items.reduce((sum, i) => sum + i.qty, 0)} шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite/60">Сумма:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="border-t border-graphite/10 pt-4">
                <div className="flex justify-between text-lg font-semibold mb-4">
                  <span>К оплате:</span>
                  <span className="text-moss">{formatPrice(total)}</span>
                </div>
                <Link href="/checkout" className="btn btn-primary w-full">
                  Оформить заказ
                </Link>
              </div>

              <p className="text-xs text-graphite/60 text-center">
                Доставка рассчитывается на следующем шаге
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

