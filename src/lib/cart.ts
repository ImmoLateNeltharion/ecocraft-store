'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from './db'

const CartItemSchema = z.object({
  productId: z.string(),
  sizeId: z.string().optional(),
  qty: z.number().int().min(1)
})

const CartSchema = z.array(CartItemSchema)

export type CartItem = z.infer<typeof CartItemSchema>

const CART_KEY = 'ecocraft_cart'
const MAX_QTY_PER_ITEM = 20

async function saveCart(cart: CartItem[]) {
  const cookieStore = await cookies()
  cookieStore.set(CART_KEY, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 дней
  })
}

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(CART_KEY)?.value

  try {
    return CartSchema.parse(JSON.parse(raw ?? '[]'))
  } catch {
    return []
  }
}

/**
 * Корзина, сверенная с базой: подтягивает товары и размеры,
 * выбрасывает позиции, чей товар или размер уже удалён,
 * и ограничивает количество остатком на складе.
 */
export async function getCartItems() {
  const cart = await getCart()
  if (cart.length === 0) {
    return { items: [], total: 0, removed: 0, adjusted: 0 }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: cart.map((i) => i.productId) } },
    include: { images: true, sizes: true }
  })

  let removed = 0
  let adjusted = 0
  const items = []

  for (const entry of cart) {
    const product = products.find((p) => p.id === entry.productId)
    if (!product) { removed++; continue }

    const size = entry.sizeId ? product.sizes.find((s) => s.id === entry.sizeId) : undefined
    if (entry.sizeId && !size) { removed++; continue }

    // Товар с размерами должен быть выбран с размером
    if (!entry.sizeId && product.sizes.length > 0) { removed++; continue }

    const available = size ? size.inStock : Infinity
    let qty = entry.qty
    if (qty > available) {
      qty = available
      adjusted++
    }
    if (qty <= 0) { removed++; continue }

    items.push({
      product,
      size,
      sizeId: entry.sizeId,
      qty,
      lineTotal: product.price * qty
    })
  }

  const total = items.reduce((sum, i) => sum + i.lineTotal, 0)
  return { items, total, removed, adjusted }
}

export async function addToCart(item: { productId: string; sizeId?: string; qty?: number }) {
  const qty = item.qty ?? 1

  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    include: { sizes: true }
  })
  if (!product) {
    return { success: false, error: 'Товар не найден' }
  }

  let available = Infinity
  if (product.sizes.length > 0) {
    const size = product.sizes.find((s) => s.id === item.sizeId)
    if (!size) {
      return { success: false, error: 'Выберите размер' }
    }
    available = size.inStock
  }

  const cart = await getCart()
  const idx = cart.findIndex((i) => i.productId === item.productId && i.sizeId === item.sizeId)
  const current = idx >= 0 ? cart[idx].qty : 0
  const wanted = current + qty

  if (available <= 0) {
    return { success: false, error: 'Этого размера сейчас нет в наличии' }
  }
  if (wanted > available) {
    return {
      success: false,
      error: available === 1
        ? 'В наличии только 1 шт., она уже в корзине'
        : `В наличии только ${available} шт.`
    }
  }
  if (wanted > MAX_QTY_PER_ITEM) {
    return { success: false, error: `Не больше ${MAX_QTY_PER_ITEM} шт. одной позиции` }
  }

  if (idx >= 0) {
    cart[idx].qty = wanted
  } else {
    cart.push({ productId: item.productId, sizeId: item.sizeId, qty })
  }

  await saveCart(cart)
  return { success: true }
}

export async function removeFromCart(productId: string, sizeId?: string) {
  const cart = (await getCart()).filter(
    (i) => !(i.productId === productId && i.sizeId === sizeId)
  )
  await saveCart(cart)
}

export async function updateCartItemQty(productId: string, sizeId: string | undefined, qty: number) {
  const cart = await getCart()
  const idx = cart.findIndex((i) => i.productId === productId && i.sizeId === sizeId)
  if (idx < 0) return

  if (qty <= 0) {
    cart.splice(idx, 1)
  } else {
    let available = MAX_QTY_PER_ITEM
    if (sizeId) {
      const size = await prisma.size.findUnique({ where: { id: sizeId } })
      available = Math.min(available, size?.inStock ?? 0)
    }
    cart[idx].qty = Math.min(qty, Math.max(available, 1))
  }

  await saveCart(cart)
}

export async function clearCart() {
  await saveCart([])
}
