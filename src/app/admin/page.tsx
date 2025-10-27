import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'

export default async function AdminPage() {
  const isAuth = await checkAdminAuth()
  
  if (!isAuth) {
    redirect('/admin/login')
  }

  // Получаем статистику
  const [ordersCount, newOrdersCount, productsCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'NEW' } }),
    prisma.product.count()
  ])

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  })

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif text-graphite">Панель управления</h2>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-sm text-graphite/60 mb-1">Всего заказов</div>
          <div className="text-3xl font-bold text-graphite">{ordersCount}</div>
        </div>
        
        <div className="card p-6">
          <div className="text-sm text-graphite/60 mb-1">Новые заказы</div>
          <div className="text-3xl font-bold text-moss">{newOrdersCount}</div>
        </div>
        
        <div className="card p-6">
          <div className="text-sm text-graphite/60 mb-1">Товаров</div>
          <div className="text-3xl font-bold text-graphite">{productsCount}</div>
        </div>
      </div>

      {/* Последние заказы */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-graphite">Последние заказы</h3>
          <a href="/admin/orders" className="text-sm text-moss hover:underline">
            Все заказы →
          </a>
        </div>

        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-graphite/60 text-center py-8">Заказов пока нет</p>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="border border-graphite/10 rounded-lg p-4 hover:bg-sand/20 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-graphite">№{order.orderNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'NEW' ? 'bg-moss/10 text-moss' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status === 'NEW' ? 'Новый' :
                         order.status === 'CONFIRMED' ? 'Подтвержден' :
                         order.status === 'PROCESSING' ? 'В обработке' :
                         order.status === 'SHIPPED' ? 'Отправлен' :
                         order.status === 'DELIVERED' ? 'Доставлен' :
                         'Отменен'}
                      </span>
                    </div>
                    <div className="text-sm text-graphite/70 mb-1">{order.name} · {order.phone}</div>
                    <div className="text-xs text-graphite/50">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-graphite">{formatPrice(order.total)}</div>
                    <div className="text-xs text-graphite/60">{order.items.length} поз.</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

