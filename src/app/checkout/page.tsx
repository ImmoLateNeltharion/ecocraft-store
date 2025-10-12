import { getCart, clearCart } from '@/lib/cart'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import { redirect } from 'next/navigation'

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

  async function handleSubmit(formData: FormData) {
    'use server'
    
    // Здесь можно добавить отправку на email или сохранение в БД
    const orderData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      delivery: formData.get('delivery'),
      comment: formData.get('comment'),
      items: items.map(i => ({
        product: i.p.title,
        size: i.size?.label,
        qty: i.qty,
        price: i.p.price
      })),
      total
    }

    console.log('Новый заказ:', orderData)
    
    // Очищаем корзину
    await clearCart()
    
    // Перенаправляем на страницу успеха
    redirect('/checkout/success')
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
        <form action={handleSubmit} className="card p-6 space-y-6">
          <h2 className="text-xl font-medium text-graphite">Контактные данные</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-graphite">
                Имя *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Иван Иванов"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-graphite">
                Телефон *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="input"
                placeholder="+7 (900) 123-45-67"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-graphite">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="ivan@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-graphite">
              Адрес доставки *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              className="input"
              placeholder="Город, улица, дом, квартира"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="delivery" className="text-sm font-medium text-graphite">
              Способ доставки *
            </label>
            <select id="delivery" name="delivery" required className="select">
              <option value="pickup">Пункт выдачи (CDEK, Boxberry)</option>
              <option value="courier">Курьерская доставка</option>
              <option value="post">Почта России</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-graphite">
              Комментарий к заказу
            </label>
            <textarea
              id="comment"
              name="comment"
              className="textarea"
              placeholder="Укажите пожелания по доставке или другие детали..."
            />
          </div>

          <div className="bg-sand/30 rounded-xl2 p-4 text-sm text-graphite/70">
            <p className="mb-2">
              <strong>Обратите внимание:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>После оформления заказа мы свяжемся с вами для подтверждения</li>
              <li>Оплата производится при получении или по согласованию</li>
              <li>Доставка по России — от 3 до 7 дней</li>
            </ul>
          </div>

          <button type="submit" className="btn btn-primary w-full text-lg py-3">
            Подтвердить заказ
          </button>
        </form>
      </div>
    </div>
  )
}

