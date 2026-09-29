import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPaymentInfo } from '@/lib/yookassa'
import { formatMoney, notifyOwner } from '@/lib/notify'
import { deliveryLabel } from '@/lib/site'

export const metadata = { title: 'Заказ оформлен', robots: { index: false } }

export default async function OrderSuccessPage({ params }: { params: { id: string } }) {
  let order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  })

  if (!order) {
    redirect('/')
  }

  // Покупатель вернулся с ЮKassa раньше, чем пришёл webhook: сверяем статус сами.
  if (order.paymentStatus !== 'SUCCEEDED' && order.paymentId) {
    const info = await getPaymentInfo(order.paymentId)
    if (info.success && info.payment?.status === 'succeeded') {
      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'SUCCEEDED',
          ...(order.status === 'NEW' && { status: 'CONFIRMED' })
        },
        include: { items: true }
      })
      await notifyOwner(
        `💰 Оплачен заказ №${order.orderNumber}\nСумма: ${formatMoney(order.total)}\nПокупатель: ${order.name}, ${order.phone}`
      )
    }
  }

  const isPaid = order.paymentStatus === 'SUCCEEDED'
  const isCancelled = order.paymentStatus === 'CANCELED' || order.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-moss/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card p-8 space-y-6 text-center">
          {/* Иконка */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isPaid ? 'bg-green-100' : isCancelled ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {isPaid ? (
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isCancelled ? (
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          {/* Заголовок */}
          <div>
            <h1 className="text-3xl font-serif text-graphite mb-2">
              {isPaid ? 'Оплата успешна!' : isCancelled ? 'Оплата не прошла' : 'Заказ оформлен!'}
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
          ) : isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700">
                Платёж отменён. Вы можете попробовать оплатить ещё раз.
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
              <div className="flex justify-between gap-4">
                <span className="text-graphite/60">Доставка:</span>
                <span className="font-medium text-right">{deliveryLabel(order.delivery)}, {order.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-graphite/10">
              <div className="text-sm text-graphite/60 mb-2">Товары:</div>
              <div className="space-y-2">
                {order.items.map((item) => (
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
            {!isPaid && order.status !== 'CANCELLED' && (
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
              <>Спасибо! Мы свяжемся с вами по телефону <strong>{order.phone}</strong> или email <strong>{order.email}</strong>, чтобы согласовать доставку</>
            ) : (
              <>После оплаты мы свяжемся с вами, чтобы согласовать доставку</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
