'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'

export async function updateOrderStatus(formData: FormData) {
  try {
    const orderId = formData.get('orderId')?.toString()
    const status = formData.get('status')?.toString() as OrderStatus
    
    if (!orderId || !status) {
      throw new Error('Не указан заказ или статус')
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath('/admin/orders')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    return { success: false, error: 'Не удалось обновить статус' }
  }
}

