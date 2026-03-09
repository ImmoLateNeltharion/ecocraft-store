'use client'

import { deleteCategory } from './actions'

export default function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  async function handleDelete() {
    if (!confirm(`Удалить категорию "${categoryName}"? Это действие нельзя отменить.`)) return
    await deleteCategory(categoryId)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="btn btn-secondary text-sm px-3 py-1 text-red-600 hover:bg-red-50"
    >
      Удалить
    </button>
  )
}
