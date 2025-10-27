import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import PaymentButton from './PaymentButton'

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  })

  if (!order) {
    redirect('/')
  }

  // Если уже оплачен - редирект на success
  if (order.paymentStatus === 'SUCCEEDED') {
    redirect(`/orders/${order.id}/success`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-moss/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card p-8 space-y-6">
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-3xl font-serif text-graphite mb-2">
              Оплата заказа
            </h1>
            <p className="text-graphite/60">
              №{order.orderNumber}
            </p>
          </div>

          {/* Информация о заказе */}
          <div className="bg-sand/30 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-graphite/10">
              <span className="text-graphite/70">Сумма к оплате:</span>
              <span className="text-3xl font-bold text-moss">{formatPrice(order.total)}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-graphite/60">Получатель:</span>
                <span className="font-medium">{order.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/60">Email:</span>
                <span className="font-medium">{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite/60">Телефон:</span>
                <span className="font-medium">{order.phone}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-graphite/10">
              <div className="text-sm text-graphite/60 mb-2">Товары:</div>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.product}</span>
                      <span className="text-graphite/60"> · {item.size}</span>
                      <span className="text-graphite/60"> × {item.qty}</span>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Кнопка оплаты */}
          <PaymentButton orderId={order.id} paymentUrl={order.paymentUrl} />

          {/* Безопасность */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-graphite/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Безопасная оплата через ЮKassa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

