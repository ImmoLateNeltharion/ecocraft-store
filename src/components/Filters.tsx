'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = {
  category: [
    ['', 'Все категории'],
    ['BLANKET', 'Одеяла'],
    ['SHOPPER', 'Шоперы']
  ],
  material: [
    ['', 'Все материалы'],
    ['NETTLE', 'Крапива'],
    ['MUSLIN', 'Муслин'],
    ['FLANNEL', 'Фланель'],
    ['TENCEL', 'Тенсель'],
    ['RECYCLED', 'Переработанное']
  ],
  warmth: [
    ['', 'Любая теплота'],
    ['LIGHT', 'Лёгкое'],
    ['MEDIUM', 'Среднее'],
    ['WARM', 'Тёплое']
  ]
} as const

export default function Filters() {
  const router = useRouter()
  const sp = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/catalog?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(OPTIONS).map(([key, list]) => (
        <select
          key={key}
          className="select text-sm"
          value={sp.get(key) ?? ''}
          onChange={(e) => update(key, e.target.value)}
        >
          {list.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}

