'use server'

import { clearCart } from '@/lib/cart'
import { redirect } from 'next/navigation'

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
    const comment = formData.get('comment')?.toString()
    
    // Создаем объект заказа
    const orderData = {
      name,
      phone,
      email,
      address,
      delivery,
      comment,
      items: orderItems,
      total
    }

    console.log('Новый заказ:', orderData)
    
    // Очищаем корзину
    await clearCart()
    
    // Перенаправляем на страницу успеха
    redirect('/checkout/success')
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error)
    throw error
  }
}

