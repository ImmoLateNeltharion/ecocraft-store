import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 Webhook от ЮКассы:', body)

    // Проверяем тип события
    if (body.event !== 'payment.succeeded' && body.event !== 'payment.canceled') {
      return NextResponse.json({ success: true })
    }

    const payment = body.object
    const paymentId = payment.id
    const status = payment.status
    const metadata = payment.metadata

    if (!metadata?.orderId) {
      console.error('❌ orderId не найден в metadata платежа')
      return NextResponse.json({ error: 'orderId not found' }, { status: 400 })
    }

    const orderId = metadata.orderId

    // Обновляем статус платежа в заказе
    const paymentStatus = 
      status === 'succeeded' ? 'SUCCEEDED' :
      status === 'canceled' ? 'CANCELED' :
      status === 'waiting_for_capture' ? 'WAITING_FOR_CAPTURE' :
      'PENDING'

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        // Если платеж успешен - подтверждаем заказ
        ...(status === 'succeeded' && {
          status: 'CONFIRMED'
        })
      }
    })

    console.log(`✅ Обновлен статус заказа ${orderId}: ${paymentStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

