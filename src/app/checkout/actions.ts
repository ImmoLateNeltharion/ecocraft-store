'use server'

import { clearCart } from '@/lib/cart'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export async function submitOrder(formData: FormData, orderItems: Array<{
  product: string
  size: string
  qty: number
  price: number
}>, total: number) {
  try {
    // Получаем данные из формы
    const name = formData.get('name')?.toString()
    const phone = formData.get('phone')?.toString()
    const email = formData.get('email')?.toString()
    const address = formData.get('address')?.toString()
    const delivery = formData.get('delivery')?.toString()
    const comment = formData.get('comment')?.toString() || undefined
    
    if (!name || !phone || !email || !address || !delivery) {
      throw new Error('Заполните все обязательные поля')
    }

    // Сохраняем заказ в базу данных
    const order = await prisma.order.create({
      data: {
        name,
        phone,
        email,
        address,
        delivery,
        comment,
        total,
        items: {
          create: orderItems.map(item => ({
            product: item.product,
            size: item.size,
            qty: item.qty,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('✅ Заказ создан:', order.orderNumber)
    
    // Очищаем корзину
    await clearCart()
    
    // Перенаправляем на страницу успеха
    redirect('/checkout/success?order=' + order.orderNumber)
  } catch (error) {
    console.error('❌ Ошибка при оформлении заказа:', error)
    throw error
  }
}

