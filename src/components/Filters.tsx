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

export const SORT_OPTIONS = [
  ['', 'Сначала новые'],
  ['price_asc', 'Сначала дешевле'],
  ['price_desc', 'Сначала дороже'],
  ['title', 'По названию']
] as const

export default function Filters({ categories }: { categories: ProductCategory[] }) {
  const router = useRouter()
  const sp = useSearchParams()

  const hasFilters = ['category', 'material', 'warmth', 'sort'].some((k) => sp.get(k))

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `/catalog?${qs}` : '/catalog')
  }

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
      <select
        aria-label="Категория"
        className="select text-sm sm:w-auto"
        value={sp.get('category') ?? ''}
        onChange={(e) => update('category', e.target.value)}
      >
        <option value="">Все категории</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        aria-label="Материал"
        className="select text-sm sm:w-auto"
        value={sp.get('material') ?? ''}
        onChange={(e) => update('material', e.target.value)}
      >
        {MATERIAL_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        aria-label="Теплота"
        className="select text-sm sm:w-auto"
        value={sp.get('warmth') ?? ''}
        onChange={(e) => update('warmth', e.target.value)}
      >
        {WARMTH_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        aria-label="Сортировка"
        className="select text-sm sm:w-auto sm:ml-auto"
        value={sp.get('sort') ?? ''}
        onChange={(e) => update('sort', e.target.value)}
      >
        {SORT_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push('/catalog')}
          className="text-sm text-graphite/60 hover:text-moss underline hover:no-underline sm:ml-1"
        >
          Сбросить
        </button>
      )}
    </div>
  )
}
