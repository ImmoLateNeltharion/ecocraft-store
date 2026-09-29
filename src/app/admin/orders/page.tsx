import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OrderStatus, Prisma } from '@prisma/client'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/currency'
import { deliveryLabel } from '@/lib/site'
import OrderStatusBadge from './OrderStatusBadge'
import UpdateStatusForm from './UpdateStatusForm'

const PAGE_SIZE = 20

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'NEW', label: 'Новые' },
  { value: 'CONFIRMED', label: 'Подтверждённые' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'SHIPPED', label: 'Отправленные' },
  { value: 'DELIVERED', label: 'Доставленные' },
  { value: 'CANCELLED', label: 'Отменённые' }
]

function paymentBadge(status: string) {
  switch (status) {
    case 'SUCCEEDED': return { cls: 'bg-green-100 text-green-700', text: '💳 Оплачено' }
    case 'PENDING': return { cls: 'bg-yellow-100 text-yellow-700', text: '⏳ Ожидает оплаты' }
    case 'WAITING_FOR_CAPTURE': return { cls: 'bg-blue-100 text-blue-700', text: '🔄 Ожидает подтверждения' }
    default: return { cls: 'bg-gray-100 text-gray-700', text: '❌ Платёж отменён' }
  }
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string; page?: string }
}) {
  const isAuth = await checkAdminAuth()
  if (!isAuth) {
    redirect('/admin/login')
  }

  const status = STATUS_FILTERS.some((s) => s.value === searchParams.status) ? searchParams.status : ''
  const q = (searchParams.q ?? '').trim()
  const page = Math.max(1, Number(searchParams.page) || 1)

  const where: Prisma.OrderWhereInput = {}
  if (status) where.status = status as OrderStatus
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } }
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.order.count({ where })
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/admin/orders?${qs}` : '/admin/orders'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-serif text-graphite">Заказы</h2>
        <div className="text-sm text-graphite/60">
          Найдено: {total}
        </div>
      </div>

      {/* Фильтры */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s.value}
              href={`/admin/orders?${new URLSearchParams({ ...(s.value && { status: s.value }), ...(q && { q }) })}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                status === s.value
                  ? 'bg-moss text-white border-moss'
                  : 'bg-white text-graphite border-graphite/15 hover:border-moss'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <form method="get" action="/admin/orders" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Номер заказа, имя, телефон или email"
            className="input text-sm"
          />
          <button type="submit" className="btn btn-secondary text-sm whitespace-nowrap">Найти</button>
          {q && (
            <Link href={status ? `/admin/orders?status=${status}` : '/admin/orders'} className="btn btn-secondary text-sm" aria-label="Сбросить поиск">
              ✕
            </Link>
          )}
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-graphite/60">{q || status ? 'Ничего не найдено' : 'Заказов пока нет'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const pay = paymentBadge(order.paymentStatus)
            return (
              <div key={order.id} className="card p-4 md:p-6 space-y-4">
                {/* Заголовок заказа */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-graphite/10">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg md:text-xl font-medium text-graphite break-all">
                        Заказ №{order.orderNumber}
                      </h3>
                      <OrderStatusBadge status={order.status} />
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${pay.cls}`}>{pay.text}</span>
                    </div>
                    <div className="text-sm text-graphite/60">
                      {new Date(order.createdAt).toLocaleString('ru-RU', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold text-moss">{formatPrice(order.total)}</div>
                    <div className="text-sm text-graphite/60">{order.items.length} поз.</div>
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
                      <a href={`tel:${order.phone}`} className="hover:text-moss">{order.phone}</a>
                    </div>
                  </div>
                  <div>
                    <div className="text-graphite/60 mb-1">Email</div>
                    <div className="font-medium break-all">
                      <a href={`mailto:${order.email}`} className="hover:text-moss">{order.email}</a>
                    </div>
                  </div>
                  <div>
                    <div className="text-graphite/60 mb-1">Доставка</div>
                    <div className="font-medium">{deliveryLabel(order.delivery)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-graphite/60 mb-1">Адрес</div>
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
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm bg-sand/20 rounded-lg p-3">
                        <div>
                          <span className="font-medium">{item.product}</span>
                          <span className="text-graphite/60"> · {item.size}</span>
                          <span className="text-graphite/60"> × {item.qty}</span>
                        </div>
                        <div className="font-medium whitespace-nowrap">{formatPrice(item.price * item.qty)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Управление статусом */}
                <div className="pt-4 border-t border-graphite/10">
                  <UpdateStatusForm orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Пагинация */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={pageHref(page - 1)} className="btn btn-secondary">← Назад</Link>}
          <span className="text-graphite/60 px-2">Страница {page} из {pages}</span>
          {page < pages && <Link href={pageHref(page + 1)} className="btn btn-secondary">Вперёд →</Link>}
        </div>
      )}
    </div>
  )
}
