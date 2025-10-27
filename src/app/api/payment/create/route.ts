import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPayment } from '@/lib/yookassa'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Проверяем, не создан ли уже платеж
    if (order.paymentId) {
      return NextResponse.json({
        success: true,
        paymentUrl: order.paymentUrl,
        paymentId: order.paymentId
      })
    }

    // Создаём платеж в ЮКассе
    const description = `Заказ №${order.orderNumber} на сумму ${(order.total / 100).toFixed(2)} ₽`
    
    const paymentResult = await createPayment({
      amount: order.total,
      orderId: order.id,
      orderNumber: order.orderNumber,
      description,
      email: order.email
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Не удалось создать платеж' },
        { status: 500 }
      )
    }

    // Сохраняем данные платежа в заказ
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: paymentResult.paymentId,
        paymentUrl: paymentResult.paymentUrl,
        paymentStatus: paymentResult.status === 'pending' ? 'PENDING' : 'WAITING_FOR_CAPTURE'
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      paymentId: paymentResult.paymentId
    })
  } catch (error) {
    console.error('❌ Ошибка создания платежа:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

