export function formatPrice(cents: number, currency = 'RUB') {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100)
}

