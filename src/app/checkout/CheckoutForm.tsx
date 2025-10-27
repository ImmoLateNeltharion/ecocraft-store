'use client'

import { submitOrder } from './actions'

export default function CheckoutForm({ 
  orderItems,
  total
}: { 
  orderItems: Array<{
    product: string
    size: string
    qty: number
    price: number
  }>
  total: number
}) {
  async function handleSubmit(formData: FormData) {
    await submitOrder(formData, orderItems, total)
  }

  return (
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
  )
}

