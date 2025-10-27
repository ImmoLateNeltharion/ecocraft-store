import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout'

if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
  console.warn('⚠️ ЮKassa credentials not configured. Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY in .env')
}

const checkout = new YooCheckout({
  shopId: process.env.YOOKASSA_SHOP_ID || '',
  secretKey: process.env.YOOKASSA_SECRET_KEY || ''
})

export interface CreatePaymentParams {
  amount: number // в копейках
  orderId: string
  orderNumber: string
  description: string
  email?: string
}

export async function createPayment(params: CreatePaymentParams) {
  const { amount, orderId, orderNumber, description, email } = params

  const payment: ICreatePayment = {
    amount: {
      value: (amount / 100).toFixed(2), // конвертируем копейки в рубли
      currency: 'RUB'
    },
    confirmation: {
      type: 'redirect',
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/success`
    },
    capture: true,
    description,
    metadata: {
      orderId,
      orderNumber
    },
    ...(email && {
      receipt: {
        customer: {
          email
        },
        items: [
          {
            description: description,
            quantity: '1',
            amount: {
              value: (amount / 100).toFixed(2),
              currency: 'RUB'
            },
            vat_code: 1 // НДС не облагается
          }
        ]
      }
    })
  }

  try {
    const result = await checkout.createPayment(payment)
    return {
      success: true,
      paymentId: result.id,
      paymentUrl: result.confirmation?.confirmation_url,
      status: result.status
    }
  } catch (error: any) {
    console.error('❌ Ошибка создания платежа:', error)
    return {
      success: false,
      error: error.message || 'Не удалось создать платеж'
    }
  }
}

export async function getPaymentInfo(paymentId: string) {
  try {
    const payment = await checkout.getPayment(paymentId)
    return {
      success: true,
      payment
    }
  } catch (error: any) {
    console.error('❌ Ошибка получения информации о платеже:', error)
    return {
      success: false,
      error: error.message || 'Не удалось получить информацию о платеже'
    }
  }
}

export async function capturePayment(paymentId: string, amount?: number) {
  try {
    const payment = await checkout.capturePayment(paymentId, {
      ...(amount && {
        amount: {
          value: (amount / 100).toFixed(2),
          currency: 'RUB'
        }
      })
    })
    return {
      success: true,
      payment
    }
  } catch (error: any) {
    console.error('❌ Ошибка подтверждения платежа:', error)
    return {
      success: false,
      error: error.message || 'Не удалось подтвердить платеж'
    }
  }
}

export async function cancelPayment(paymentId: string) {
  try {
    const payment = await checkout.cancelPayment(paymentId)
    return {
      success: true,
      payment
    }
  } catch (error: any) {
    console.error('❌ Ошибка отмены платежа:', error)
    return {
      success: false,
      error: error.message || 'Не удалось отменить платеж'
    }
  }
}

