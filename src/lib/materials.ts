export const MATERIAL_LABELS: Record<string, string> = {
  LINEN: 'Лён',
  COTTON: 'Хлопок',
  WOOL: 'Шерсть',
  BAMBOO: 'Бамбук',
  RECYCLED: 'Переработанное',
  NETTLE: 'Крапива',
  MUSLIN: 'Муслин',
  FLANNEL: 'Фланель',
  TENCEL: 'Тенсель'
}

// Экологичные материалы, которые хотим показывать на сайте
export const ECO_MATERIAL_KEYS = new Set([
  'LINEN',
  'NETTLE',
  'MUSLIN',
  'FLANNEL',
  'TENCEL',
  'RECYCLED'
] as const)

export function formatMaterialsList(values?: string[] | null) {
  if (!values || values.length === 0) return ''
  return values
    .filter((value) => ECO_MATERIAL_KEYS.has(value as any))
    .map((value) => MATERIAL_LABELS[value] || value)
    .join(' + ')
}

