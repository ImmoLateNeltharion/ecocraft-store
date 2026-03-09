'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCategory } from '@prisma/client'

const MATERIAL_OPTIONS = [
  ['', 'Все материалы'],
  ['LINEN', 'Лён'],
  ['NETTLE', 'Крапива'],
  ['MUSLIN', 'Муслин'],
  ['FLANNEL', 'Фланель'],
  ['TENCEL', 'Тенсель'],
  ['RECYCLED', 'Переработанное']
] as const

const WARMTH_OPTIONS = [
  ['', 'Любая теплота'],
  ['LIGHT', 'Лёгкое'],
  ['MEDIUM', 'Среднее'],
  ['WARM', 'Тёплое']
] as const

export default function Filters({ categories }: { categories: ProductCategory[] }) {
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
      <select
        className="select text-sm"
        value={sp.get('category') ?? ''}
        onChange={(e) => update('category', e.target.value)}
      >
        <option value="">Все категории</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        className="select text-sm"
        value={sp.get('material') ?? ''}
        onChange={(e) => update('material', e.target.value)}
      >
        {MATERIAL_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        className="select text-sm"
        value={sp.get('warmth') ?? ''}
        onChange={(e) => update('warmth', e.target.value)}
      >
        {WARMTH_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  )
}
