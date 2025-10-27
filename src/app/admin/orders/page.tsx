import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import OrderStatusBadge from './OrderStatusBadge'
import UpdateStatusForm from './UpdateStatusForm'

export default async function AdminOrdersPage() {
  const isAuth = await checkAdminAuth()
  
  if (!isAuth) {
    redirect('/admin/login')
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-graphite">Заказы</h2>
        <div className="text-sm text-graphite/60">
          Всего: {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-graphite/60">Заказов пока нет</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6 space-y-4">
              {/* Заголовок заказа */}
              <div className="flex items-start justify-between pb-4 border-b border-graphite/10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-medium text-graphite">
                      Заказ №{order.orderNumber}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                    {/* Статус оплаты */}
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      order.paymentStatus === 'SUCCEEDED' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.paymentStatus === 'WAITING_FOR_CAPTURE' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.paymentStatus === 'SUCCEEDED' ? '💳 Оплачено' :
                       order.paymentStatus === 'PENDING' ? '⏳ Ожидает оплаты' :
                       order.paymentStatus === 'WAITING_FOR_CAPTURE' ? '🔄 Ожидает подтверждения' :
                       '❌ Отменено'}
                    </span>
                  </div>
                  <div className="text-sm text-graphite/60">
                    {new Date(order.createdAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-moss">{formatPrice(order.total)}</div>
                  <div className="text-sm text-graphite/60">{order.items.length} товар(ов)</div>
                </div>
              </div>

              {/* Контактная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-graphite/60 mb-1">Покупатель</div>
                  <div className="font-medium">{order.name}</div>
                </div>
                
                <div>
                  <div className="text-graphite/60 mb-1">Телефон</div>
                  <div className="font-medium">
                    <a href={`tel:${order.phone}`} className="hover:text-moss">
                      {order.phone}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-graphite/60 mb-1">Email</div>
                  <div className="font-medium">
                    <a href={`mailto:${order.email}`} className="hover:text-moss">
                      {order.email}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="text-graphite/60 mb-1">Доставка</div>
                  <div className="font-medium">
                    {order.delivery === 'pickup' ? 'Пункт выдачи' :
                     order.delivery === 'courier' ? 'Курьер' :
                     'Почта России'}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="text-graphite/60 mb-1">Адрес доставки</div>
                  <div className="font-medium">{order.address}</div>
                </div>
                
                {order.comment && (
                  <div className="md:col-span-2">
                    <div className="text-graphite/60 mb-1">Комментарий</div>
                    <div className="font-medium italic">{order.comment}</div>
                  </div>
                )}
              </div>

              {/* Товары */}
              <div>
                <div className="text-sm text-graphite/60 mb-2">Товары:</div>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm bg-sand/20 rounded-lg p-3">
                      <div>
                        <span className="font-medium">{item.product}</span>
                        <span className="text-graphite/60"> · {item.size}</span>
                        <span className="text-graphite/60"> × {item.qty}</span>
                      </div>
                      <div className="font-medium">{formatPrice(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Управление статусом */}
              <div className="pt-4 border-t border-graphite/10">
                <UpdateStatusForm orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

