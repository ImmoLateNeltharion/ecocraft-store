// Реквизиты и контакты магазина. Юридические данные берутся из .env,
// чтобы не хранить их в коде.

export const SITE = {
  name: 'Долина снов Анэль',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: 'anya.korotkih.ru@gmail.com',
  phone: '+7 909 208 2056',
  phoneHref: 'tel:+79092082056',
  vk: 'https://vk.com/dolinasnova5342',
  // Реквизиты. Пустые поля на сайте не показываются.
  legal: {
    entity: process.env.LEGAL_ENTITY || '',   // например: "ИП Иванова Анна Ивановна"
    inn: process.env.LEGAL_INN || '',
    ogrnip: process.env.LEGAL_OGRNIP || '',
    address: process.env.LEGAL_ADDRESS || ''
  }
}

export const CONTACT_SUBJECTS: Record<string, string> = {
  order: 'Вопрос по заказу',
  custom: 'Индивидуальный заказ',
  wholesale: 'Оптовые закупки',
  cooperation: 'Сотрудничество',
  other: 'Другое'
}

export const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Пункт выдачи (CDEK, Boxberry)' },
  { value: 'courier', label: 'Курьерская доставка' },
  { value: 'post', label: 'Почта России' }
] as const

export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number]['value']

export function deliveryLabel(value: string) {
  return DELIVERY_OPTIONS.find((o) => o.value === value)?.label ?? value
}

/** Строка реквизитов для подвала и документов: только заполненные поля */
export function legalLine() {
  const l = SITE.legal
  return [l.entity, l.inn && `ИНН ${l.inn}`, l.ogrnip && `ОГРНИП ${l.ogrnip}`, l.address && `адрес: ${l.address}`]
    .filter(Boolean)
    .join(', ')
}
