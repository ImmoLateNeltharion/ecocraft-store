// Реквизиты и контакты магазина. Юридические данные берутся из .env,
// чтобы не хранить их в коде.

export const SITE = {
  name: 'Долина снов Анэль',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  email: 'anya.korotkih.ru@gmail.com',
  phone: '+7 909 208 2056',
  phoneHref: 'tel:+79092082056',
  vk: 'https://vk.com/dolinasnova5342',
  legal: {
    // Например: "ИП Иванова Анна Ивановна"
    entity: process.env.LEGAL_ENTITY || 'ИП (укажите в LEGAL_ENTITY)',
    inn: process.env.LEGAL_INN || '(укажите в LEGAL_INN)',
    ogrnip: process.env.LEGAL_OGRNIP || '(укажите в LEGAL_OGRNIP)',
    address: process.env.LEGAL_ADDRESS || '(укажите в LEGAL_ADDRESS)'
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
