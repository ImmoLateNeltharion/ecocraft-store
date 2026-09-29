'use server'

import { addToCart } from '@/lib/cart'
import { revalidatePath } from 'next/cache'

export async function handleAddToCart(productId: string, formData: FormData) {
  try {
    const sizeId = formData.get('sizeId')?.toString() || undefined
    const result = await addToCart({ productId, sizeId, qty: 1 })

    if (result.success) {
      // Счётчик корзины живёт в шапке (root layout), поэтому обновляем layout целиком
      revalidatePath('/', 'layout')
    }

    return result
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Не удалось добавить товар в корзину' }
  }
}
