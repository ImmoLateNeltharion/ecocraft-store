'use client'

import { useState } from 'react'
import { createCategory, updateCategory } from './actions'
import { ProductCategory } from '@prisma/client'

export default function CategoryForm({ category }: { category?: ProductCategory }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      if (category) {
        await updateCategory(category.id, formData)
      } else {
        await createCategory(formData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="card p-6 space-y-5 max-w-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium text-graphite">
          Название категории *
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={category?.name}
          className="input"
          placeholder="Например: Детские одеяла"
        />
        {!category && (
          <p className="text-xs text-graphite/50">
            ID категории создаётся автоматически из названия
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-graphite">
          Порядок отображения
        </label>
        <input
          name="order"
          type="number"
          defaultValue={category?.order ?? 0}
          className="input"
          placeholder="0"
          min="0"
        />
        <p className="text-xs text-graphite/50">Меньше = выше в списке</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {isLoading ? 'Сохранение...' : category ? 'Сохранить' : 'Создать категорию'}
        </button>
        <a href="/admin/categories" className="btn btn-secondary">
          Отмена
        </a>
      </div>
    </form>
  )
}
