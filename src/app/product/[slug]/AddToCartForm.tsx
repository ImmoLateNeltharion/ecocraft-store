'use client'

import { useFormStatus } from 'react-dom'
import { useState, useTransition } from 'react'
import { handleAddToCart } from './actions'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary w-full text-lg py-3 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Добавляем...
        </span>
      ) : disabled ? (
        'Нет в наличии'
      ) : (
        'Добавить в корзину'
      )}
    </button>
  )
}

export default function AddToCartForm({
  productId,
  sizes
}: {
  productId: string
  sizes: Array<{ id: string; label: string; inStock: number }>
}) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const firstAvailable = sizes.find((s) => s.inStock > 0)
  const [selectedSizeId, setSelectedSizeId] = useState(firstAvailable?.id ?? sizes[0]?.id ?? '')
  const selectedSize = sizes.find((s) => s.id === selectedSizeId)
  const soldOut = sizes.length > 0 && (!selectedSize || selectedSize.inStock <= 0)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await handleAddToCart(productId, formData)

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError(result.error ?? 'Не удалось добавить товар')
      }
    })
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-4">
        {sizes.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="sizeId" className="text-sm font-medium text-graphite">
              Выберите размер:
            </label>
            <select
              id="sizeId"
              name="sizeId"
              className="select"
              required
              value={selectedSizeId}
              onChange={(e) => { setSelectedSizeId(e.target.value); setError(null) }}
            >
              {sizes.map((s) => (
                <option key={s.id} value={s.id} disabled={s.inStock <= 0}>
                  {s.label}{s.inStock <= 0 ? ' — нет в наличии' : s.inStock <= 3 ? ` — осталось ${s.inStock} шт.` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <SubmitButton disabled={soldOut} />
      </form>

      {/* Уведомление об успехе */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-moss text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-lg">Добавлено в корзину!</div>
              <a href="/cart" className="text-sm text-white/90 underline hover:no-underline">Перейти в корзину</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
