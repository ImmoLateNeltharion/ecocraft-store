import { getCartItems } from '@/lib/cart'
import { formatPrice } from '@/lib/currency'
import { redirect } from 'next/navigation'
import CheckoutForm from './CheckoutForm'

export default async function CheckoutPage() {
  const { items, total } = await getCartItems()

  if (items.length === 0) {
    redirect('/cart')
  }

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
            {items.map((item) => (
              <div key={`${item.product.id}-${item.sizeId ?? ''}`} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.product.title}</span>
                  {item.size && <span className="text-graphite/60"> — {item.size.label}</span>}
                  <span className="text-graphite/60"> × {item.qty}</span>
                </div>
                <span className="font-medium">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-graphite/10 pt-4 flex justify-between font-semibold text-lg">
            <span>Итого:</span>
            <span className="text-moss">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Форма. Состав и сумма заказа пересчитываются на сервере из корзины */}
        <CheckoutForm />
      </div>
    </div>
  )
}
