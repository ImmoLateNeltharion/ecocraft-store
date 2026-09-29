'use client'

import { useState } from 'react'

export default function PaymentButton({ 
  orderId, 
  paymentUrl 
}: { 
  orderId: string
  paymentUrl: string | null
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePayment() {
    setIsLoading(true)
    setError('')

    try {
      // Если URL уже есть - редиректим
      if (paymentUrl) {
        window.location.href = paymentUrl
        return
      }

      // Создаём платеж
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const data = await response.json()

      if (!data.success || !data.paymentUrl) {
        setError(data.error || 'Не удалось создать платеж')
        setIsLoading(false)
        return
      }

      // Редиректим на страницу оплаты ЮКассы
      window.location.href = data.paymentUrl
    } catch (err) {
      console.error('Ошибка:', err)
      setError('Произошла ошибка при создании платежа')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="btn btn-primary w-full text-lg py-4 disabled:opacity-50 relative overflow-hidden"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Переход к оплате...
          </span>
        ) : (
          <>
            💳 Перейти к оплате
          </>
        )}
      </button>

      <p className="text-xs text-center text-graphite/60">
        Вы будете перенаправлены на защищённую страницу оплаты ЮKassa
      </p>
    </div>
  )
}

