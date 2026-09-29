'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { submitOrder } from './actions'
import { DELIVERY_OPTIONS } from '@/lib/site'

const ADDRESS_HINTS: Record<string, { label: string; placeholder: string }> = {
  pickup: { label: 'Город и адрес пункта выдачи *', placeholder: 'Москва, ПВЗ СДЭК на ул. Ленина, 10' },
  courier: { label: 'Адрес доставки *', placeholder: 'Город, улица, дом, квартира' },
  post: { label: 'Почтовый адрес с индексом *', placeholder: '123456, Москва, ул. Ленина, д. 10, кв. 5' }
}

export default function CheckoutForm() {
  const [error, setError] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<string>(DELIVERY_OPTIONS[0].value)
  const [isPending, startTransition] = useTransition()
  const addressHint = ADDRESS_HINTS[delivery] ?? ADDRESS_HINTS.courier

  function handleSubmit(formData: FormData) {
    if (isPending) return
    setError(null)
    startTransition(async () => {
      // При успехе submitOrder делает redirect и сюда не возвращается
      const result = await submitOrder(formData)
      if (result && !result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={handleSubmit} className="card p-6 space-y-6" aria-busy={isPending}>
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
            autoComplete="name"
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
            autoComplete="tel"
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
          autoComplete="email"
          className="input"
          placeholder="ivan@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="delivery" className="text-sm font-medium text-graphite">
          Способ доставки *
        </label>
        <select
          id="delivery"
          name="delivery"
          required
          className="select"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
        >
          {DELIVERY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {delivery === 'pickup' && (
          <p className="text-xs text-graphite/60">
            Найдите ближайший пункт на{' '}
            <a href="https://www.cdek.ru/ru/offices" target="_blank" rel="noopener noreferrer" className="text-moss underline">cdek.ru</a>
            {' '}или{' '}
            <a href="https://boxberry.ru/find_an_office" target="_blank" rel="noopener noreferrer" className="text-moss underline">boxberry.ru</a>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium text-graphite">
          {addressHint.label}
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          autoComplete="street-address"
          className="input"
          placeholder={addressHint.placeholder}
        />
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

      <div className="bg-sand/30 rounded-xl p-4 text-sm text-graphite/70">
        <p className="mb-2">
          <strong>Обратите внимание:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>После подтверждения заказа вы будете перенаправлены на страницу оплаты</li>
          <li>Оплата производится онлайн через защищённый платёжный шлюз ЮKassa</li>
          <li>После оплаты мы свяжемся с вами, чтобы согласовать доставку и её стоимость</li>
          <li>Доставка по России — от 3 до 7 дней</li>
        </ul>
      </div>

      <label className="flex items-start gap-3 text-sm text-graphite/80 cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-moss" />
        <span>
          Я согласен(на) на{' '}
          <Link href="/privacy" target="_blank" className="text-moss underline hover:no-underline">
            обработку персональных данных
          </Link>{' '}
          и принимаю условия{' '}
          <Link href="/offer" target="_blank" className="text-moss underline hover:no-underline">
            публичной оферты
          </Link>
          {' '}*
        </span>
      </label>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full text-lg py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Оформляем заказ...' : 'Подтвердить заказ'}
      </button>
    </form>
  )
}
