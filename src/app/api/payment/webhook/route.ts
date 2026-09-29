import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPaymentInfo } from '@/lib/yookassa'
import { formatMoney, notifyOwner } from '@/lib/notify'

// ЮKassa не подписывает уведомления, поэтому телу запроса доверять нельзя.
// Берём из него только id платежа, а статус и metadata запрашиваем у API ЮKassa
// по секретному ключу магазина. Подделать такой ответ снаружи невозможно.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const paymentId: unknown = body?.object?.id

    if (typeof paymentId !== 'string' || !paymentId) {
      return NextResponse.json({ error: 'payment id is required' }, { status: 400 })
    }

    const info = await getPaymentInfo(paymentId)
    if (!info.success || !info.payment) {
      console.error('❌ Webhook: не удалось проверить платёж', paymentId)
      // 5xx — ЮKassa повторит уведомление позже
      return NextResponse.json({ error: 'payment lookup failed' }, { status: 502 })
    }

    const payment = info.payment
    const orderId: unknown = payment.metadata?.orderId

    if (typeof orderId !== 'string' || !orderId) {
      console.error('❌ Webhook: orderId не найден в metadata платежа', paymentId)
      return NextResponse.json({ success: true })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })

    // Платёж должен принадлежать именно этому заказу
    if (!order || (order.paymentId && order.paymentId !== paymentId)) {
      console.error('❌ Webhook: платёж не соответствует заказу', { paymentId, orderId })
      return NextResponse.json({ success: true })
    }

    const paymentStatus =
      payment.status === 'succeeded' ? 'SUCCEEDED' :
      payment.status === 'canceled' ? 'CANCELED' :
      payment.status === 'waiting_for_capture' ? 'WAITING_FOR_CAPTURE' :
      'PENDING'

    const justPaid = paymentStatus === 'SUCCEEDED' && order.paymentStatus !== 'SUCCEEDED'

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId,
        paymentStatus,
        ...(justPaid && order.status === 'NEW' && { status: 'CONFIRMED' })
      }
    })

    console.log(`✅ Обновлён статус оплаты заказа ${order.orderNumber}: ${paymentStatus}`)

    if (justPaid) {
      await notifyOwner(
        `💰 Оплачен заказ №${order.orderNumber}\n` +
        `Сумма: ${formatMoney(order.total)}\n` +
        `Покупатель: ${order.name}, ${order.phone}`
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
