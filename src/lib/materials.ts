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

export function formatMaterialsList(values?: string[] | null) {
  if (!values || values.length === 0) return ''
  return values
    .map(value => MATERIAL_LABELS[value] || value)
    .join(' + ')
}

