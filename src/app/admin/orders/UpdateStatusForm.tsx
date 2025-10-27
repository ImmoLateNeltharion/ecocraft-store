'use client'

import { OrderStatus } from '@prisma/client'
import { updateOrderStatus } from './actions'
import { useState } from 'react'

export default function UpdateStatusForm({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string
  currentStatus: OrderStatus
}) {
  const [isLoading, setIsLoading] = useState(false)

  const statuses: { value: OrderStatus; label: string }[] = [
    { value: 'NEW', label: 'Новый' },
    { value: 'CONFIRMED', label: 'Подтвержден' },
    { value: 'PROCESSING', label: 'В обработке' },
    { value: 'SHIPPED', label: 'Отправлен' },
    { value: 'DELIVERED', label: 'Доставлен' },
    { value: 'CANCELLED', label: 'Отменен' }
  ]

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await updateOrderStatus(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      
      <label className="text-sm font-medium text-graphite">
        Статус:
      </label>
      
      <select 
        name="status" 
        defaultValue={currentStatus}
        className="select flex-1 max-w-xs"
        disabled={isLoading}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      
      <button 
        type="submit"
        disabled={isLoading}
        className="btn btn-primary disabled:opacity-50"
      >
        {isLoading ? 'Сохранение...' : 'Обновить'}
      </button>
    </form>
  )
}

