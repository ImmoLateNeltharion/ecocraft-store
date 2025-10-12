'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

const CartItemSchema = z.object({
  productId: z.string(),
  sizeId: z.string().optional(),
  qty: z.number().int().min(1)
})

const CartSchema = z.array(CartItemSchema)

export type CartItem = z.infer<typeof CartItemSchema>

const CART_KEY = 'ecocraft_cart'

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(CART_KEY)?.value
  
  try {
    return CartSchema.parse(JSON.parse(raw ?? '[]'))
  } catch {
    return []
  }
}

export async function addToCart(item: { productId: string, sizeId?: string, qty?: number }) {
  const cart = await getCart()
  const idx = cart.findIndex(i => i.productId === item.productId && i.sizeId === item.sizeId)
  
  if (idx >= 0) {
    cart[idx].qty += item.qty ?? 1
  } else {
    cart.push({ 
      productId: item.productId, 
      sizeId: item.sizeId, 
      qty: item.qty ?? 1 
    })
  }
  
  const cookieStore = await cookies()
  cookieStore.set(CART_KEY, JSON.stringify(cart), { 
    httpOnly: true, 
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 дней
  })
}

export async function removeFromCart(productId: string, sizeId?: string) {
  const cart = (await getCart()).filter(
    i => !(i.productId === productId && i.sizeId === sizeId)
  )
  
  const cookieStore = await cookies()
  cookieStore.set(CART_KEY, JSON.stringify(cart), { 
    httpOnly: true, 
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export async function updateCartItemQty(productId: string, sizeId: string | undefined, qty: number) {
  const cart = await getCart()
  const idx = cart.findIndex(i => i.productId === productId && i.sizeId === sizeId)
  
  if (idx >= 0) {
    if (qty <= 0) {
      cart.splice(idx, 1)
    } else {
      cart[idx].qty = qty
    }
  }
  
  const cookieStore = await cookies()
  cookieStore.set(CART_KEY, JSON.stringify(cart), { 
    httpOnly: true, 
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export async function clearCart() {
  const cookieStore = await cookies()
  cookieStore.set(CART_KEY, '[]', { 
    httpOnly: true, 
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

