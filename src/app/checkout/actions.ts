'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { clearCart, getCartItems } from '@/lib/cart'
import { formatMoney, notifyOwner } from '@/lib/notify'
import { DELIVERY_OPTIONS, deliveryLabel } from '@/lib/site'

const OrderFormSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{9,19}$/, 'Укажите корректный телефон'),
  email: z.string().trim().email('Укажите корректный email').max(200),
  address: z.string().trim().min(5, 'Укажите адрес доставки').max(500),
  delivery: z.enum(DELIVERY_OPTIONS.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: 'Выберите способ доставки' })
  }),
  comment: z.string().trim().max(1000).optional(),
  consent: z.literal('on', {
    errorMap: () => ({ message: 'Нужно согласие на обработку персональных данных' })
  })
})

export type SubmitOrderResult = { success: false; error: string }

export async function submitOrder(formData: FormData): Promise<SubmitOrderResult> {
  const parsed = OrderFormSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    delivery: formData.get('delivery'),
    comment: formData.get('comment') || undefined,
    consent: formData.get('consent')
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Проверьте заполнение формы' }
  }

  const data = parsed.data

  // Состав и цены берём из корзины и базы, а не из браузера
  const { items, total } = await getCartItems()
  if (items.length === 0) {
    return { success: false, error: 'Корзина пуста' }
  }

  let orderId: string
  let orderNumber: string

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Списываем остатки атомарно: updateMany с условием inStock >= qty
      for (const item of items) {
        if (!item.size) continue
        const res = await tx.size.updateMany({
          where: { id: item.size.id, inStock: { gte: item.qty } },
          data: { inStock: { decrement: item.qty } }
        })
        if (res.count === 0) {
          throw new OutOfStockError(`«${item.product.title}» (${item.size.label}) закончился, пока вы оформляли заказ`)
        }
      }

      return tx.order.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          delivery: data.delivery,
          comment: data.comment,
          total,
          items: {
            create: items.map((item) => ({
              product: item.product.title,
              size: item.size?.label ?? 'Не указан',
              qty: item.qty,
              price: item.product.price,
              productId: item.product.id,
              sizeId: item.size?.id
            }))
          }
        }
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted })

    orderId = order.id
    orderNumber = order.orderNumber
  } catch (error) {
    if (error instanceof OutOfStockError) {
      revalidatePath('/cart')
      return { success: false, error: error.message }
    }
    console.error('❌ Ошибка при оформлении заказа:', error)
    return { success: false, error: 'Не удалось оформить заказ. Попробуйте ещё раз или свяжитесь с нами.' }
  }

  console.log('✅ Заказ создан:', orderNumber)

  await clearCart()
  revalidatePath('/', 'layout')

  const lines = items.map((i) => `• ${i.product.title}${i.size ? ` (${i.size.label})` : ''} × ${i.qty}`)
  await notifyOwner(
    `🛒 Новый заказ №${orderNumber}\n` +
    `Сумма: ${formatMoney(total)}\n` +
    `${lines.join('\n')}\n\n` +
    `👤 ${data.name}\n📞 ${data.phone}\n✉️ ${data.email}\n` +
    `🚚 ${deliveryLabel(data.delivery)}: ${data.address}` +
    (data.comment ? `\n💬 ${data.comment}` : '') +
    `\n\nОжидает оплаты. Админка: ${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/orders`
  )

  redirect('/orders/' + orderId + '/payment')
}

class OutOfStockError extends Error {}
