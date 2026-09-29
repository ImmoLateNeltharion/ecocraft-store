'use server'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus))

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin()

  try {
    const orderId = formData.get('orderId')?.toString()
    const status = formData.get('status')?.toString()

    if (!orderId || !status || !VALID_STATUSES.has(status)) {
      throw new Error('Не указан заказ или статус')
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      })
      if (!order) throw new Error('Заказ не найден')

      const becomesCancelled = status === 'CANCELLED' && order.status !== 'CANCELLED'
      const leavesCancelled = status !== 'CANCELLED' && order.status === 'CANCELLED'

      // Остатки списываются при создании заказа: при отмене возвращаем,
      // при "разотмене" списываем снова.
      for (const item of order.items) {
        if (!item.sizeId) continue
        if (becomesCancelled) {
          await tx.size.updateMany({
            where: { id: item.sizeId },
            data: { inStock: { increment: item.qty } }
          })
        } else if (leavesCancelled) {
          await tx.size.updateMany({
            where: { id: item.sizeId },
            data: { inStock: { decrement: item.qty } }
          })
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus }
      })
    })

    revalidatePath('/admin/orders')
    revalidatePath('/admin')
    revalidatePath('/catalog')

    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    return { success: false, error: 'Не удалось обновить статус' }
  }
}
