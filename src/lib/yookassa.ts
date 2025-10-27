const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3'

if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
  console.warn('⚠️ ЮKassa credentials not configured. Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY in .env')
}

function getAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID || ''
  const secretKey = process.env.YOOKASSA_SECRET_KEY || ''
  const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
  return `Basic ${auth}`
}

async function yookassaRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${YOOKASSA_API_URL}${endpoint}`
  
  const headers: HeadersInit = {
    'Authorization': getAuthHeader(),
    'Content-Type': 'application/json',
    'Idempotence-Key': crypto.randomUUID()
  }

  const options: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  }

  const response = await fetch(url, options)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.description || error.message || 'YooKassa API error')
  }

  return response.json()
}

export interface CreatePaymentParams {
  amount: number // в копейках
  orderId: string
  orderNumber: string
  description: string
  email?: string
}

export async function createPayment(params: CreatePaymentParams) {
  const { amount, orderId, orderNumber, description } = params

  const payment = {
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
    }
  }

  try {
    const result = await yookassaRequest('/payments', 'POST', payment)
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
    const payment = await yookassaRequest(`/payments/${paymentId}`, 'GET')
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
    const body = amount ? {
      amount: {
        value: (amount / 100).toFixed(2),
        currency: 'RUB'
      }
    } : {}
    
    const payment = await yookassaRequest(`/payments/${paymentId}/capture`, 'POST', body)
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
    const payment = await yookassaRequest(`/payments/${paymentId}/cancel`, 'POST')
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

