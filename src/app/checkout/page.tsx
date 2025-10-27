import { getCart } from '@/lib/cart'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import { redirect } from 'next/navigation'
import CheckoutForm from './CheckoutForm'

export default async function CheckoutPage() {
  const cart = await getCart()
  
  if (cart.length === 0) {
    redirect('/cart')
  }

  const ids = cart.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { sizes: true }
  })

  const items = cart.map((i) => {
    const p = products.find((p) => p.id === i.productId)!
    const size = p.sizes.find((s) => s.id === i.sizeId)
    return { p, size, qty: i.qty }
  })

  const total = items.reduce((sum, i) => sum + i.p.price * i.qty, 0)
  
  // Подготавливаем данные для формы (только сериализуемые данные)
  const orderItems = items.map(i => ({
    product: i.p.title,
    size: i.size?.label || 'Не указан',
    qty: i.qty,
    price: i.p.price
  }))

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-serif text-graphite">
          Оформление заказа
        </h1>

        {/* Товары в заказе */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-medium text-graphite">Ваш заказ</h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.p.title}</span>
                  {item.size && <span className="text-graphite/60"> — {item.size.label}</span>}
                  <span className="text-graphite/60"> × {item.qty}</span>
                </div>
                <span className="font-medium">{formatPrice(item.p.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-graphite/10 pt-4 flex justify-between font-semibold text-lg">
            <span>Итого:</span>
            <span className="text-moss">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Форма */}
        <CheckoutForm orderItems={orderItems} total={total} />
      </div>
    </div>
  )
}

