'use client'

import { useState } from 'react'
import { addToCart } from '@/lib/cart'

interface AddToCartButtonProps {
  productId: string
  sizeId?: string
}

export default function AddToCartButton({ productId, sizeId }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  async function handleAddToCart() {
    setIsAdding(true)
    
    try {
      await addToCart({ productId, sizeId, qty: 1 })
      
      // Показываем анимацию успеха
      setShowSuccess(true)
      
      // Через 2 секунды скрываем
      setTimeout(() => {
        setShowSuccess(false)
        setIsAdding(false)
      }, 2000)
      
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
      setIsAdding(false)
    }
  }

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="btn btn-primary w-full text-lg py-3 relative overflow-hidden group disabled:opacity-70"
      >
        {isAdding ? (
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
        
        {/* Волна при клике */}
        {isAdding && (
          <span className="absolute inset-0 bg-white/20 animate-ping" />
        )}
      </button>

      {/* Уведомление об успехе */}
      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-moss text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Добавлено в корзину!</div>
              <div className="text-sm text-white/80">Товар успешно добавлен</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

