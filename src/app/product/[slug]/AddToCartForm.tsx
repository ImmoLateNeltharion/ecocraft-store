'use client'

import { useFormStatus } from 'react-dom'
import { useState, useEffect } from 'react'
import { addToCart } from '@/lib/cart'
import { revalidatePath } from 'next/cache'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="btn btn-primary w-full text-lg py-3 relative overflow-hidden disabled:opacity-70"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Добавляем...
        </span>
      ) : (
        'Добавить в корзину'
      )}
      
      {pending && (
        <span className="absolute inset-0 bg-white/20 animate-ping" />
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

  async function handleSubmit(formData: FormData) {
    'use server'
    
    try {
      // Получаем данные из формы
      const sizeId = formData.get('sizeId')?.toString()
      
      // Добавляем в корзину
      await addToCart({ productId, sizeId, qty: 1 })
      
      // Обновляем страницы
      revalidatePath('/cart')
      revalidatePath('/product')
      
      console.log('Added to cart:', { sizeId })
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-4">
        {sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Выберите размер:
            </label>
            <select name="sizeId" className="select" required>
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — в наличии: {s.inStock} шт.
                </option>
              ))}
            </select>
          </div>
        )}
        <SubmitButton />
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
              <div className="text-sm text-white/90">Товар успешно добавлен</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

