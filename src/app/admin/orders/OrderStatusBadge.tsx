import { OrderStatus } from '@prisma/client'

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const badges = {
    NEW: { label: 'Новый', class: 'bg-moss/10 text-moss' },
    CONFIRMED: { label: 'Подтвержден', class: 'bg-blue-100 text-blue-700' },
    PROCESSING: { label: 'В обработке', class: 'bg-yellow-100 text-yellow-700' },
    SHIPPED: { label: 'Отправлен', class: 'bg-purple-100 text-purple-700' },
    DELIVERED: { label: 'Доставлен', class: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Отменен', class: 'bg-red-100 text-red-700' }
  }

  const badge = badges[status] || { label: status, class: 'bg-gray-100 text-gray-700' }

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${badge.class}`}>
      {badge.label}
    </span>
  )
}

