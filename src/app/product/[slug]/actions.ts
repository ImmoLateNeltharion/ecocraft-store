'use server'

import { addToCart } from '@/lib/cart'
import { revalidatePath } from 'next/cache'

export async function handleAddToCart(productId: string, formData: FormData) {
  try {
    const sizeId = formData.get('sizeId')?.toString()
    await addToCart({ productId, sizeId, qty: 1 })
    revalidatePath('/cart')
    revalidatePath('/product')
    console.log('Added to cart:', { productId, sizeId })
    return { success: true }
  } catch (error) {
    console.error('Error adding to cart:', error)
    return { success: false, error: 'Не удалось добавить товар в корзину' }
  }
}

