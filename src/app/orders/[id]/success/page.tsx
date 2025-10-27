import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  })

  if (!order) {
    redirect('/')
  }

  const isPaid = order.paymentStatus === 'SUCCEEDED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-moss/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card p-8 space-y-6 text-center">
          {/* Иконка */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isPaid ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {isPaid ? (
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Заголовок */}
          <div>
            <h1 className="text-3xl font-serif text-graphite mb-2">
              {isPaid ? 'Оплата успешна!' : 'Заказ оформлен!'}
            </h1>
            <p className="text-graphite/60">
              Заказ №{order.orderNumber}
            </p>
          </div>

          {/* Статус */}
          {isPaid ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700">
                ✅ Оплата подтверждена на сумму <strong>{formatPrice(order.total)}</strong>
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700">
                📋 Заказ создан, ожидает оплаты
              </p>
            </div>
          )}

          {/* Информация */}
          <div className="bg-sand/30 rounded-xl p-6 text-left space-y-3">
            <h3 className="font-medium text-graphite mb-3">Детали заказа:</h3>
            
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
              <div className="flex justify-between">
                <span className="text-graphite/60">Адрес:</span>
                <span className="font-medium text-right">{order.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-graphite/10">
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
              
              <div className="flex justify-between pt-3 mt-3 border-t border-graphite/10 font-semibold">
                <span>Итого:</span>
                <span className="text-moss">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="space-y-3">
            {!isPaid && (
              <Link href={`/orders/${order.id}/payment`} className="btn btn-primary w-full">
                💳 Оплатить заказ
              </Link>
            )}
            
            <Link href="/" className="btn btn-secondary w-full">
              🏠 Вернуться на главную
            </Link>
          </div>

          {/* Уведомление */}
          <p className="text-sm text-graphite/60">
            {isPaid ? (
              <>Мы отправили подтверждение оплаты на <strong>{order.email}</strong></>
            ) : (
              <>Мы свяжемся с вами в ближайшее время для подтверждения заказа</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

