'use client'

import { deleteProduct } from './actions'

export default function DeleteProductButton({ productId, productTitle }: { productId: string; productTitle: string }) {
  async function handleDelete() {
    if (!confirm(`Удалить товар "${productTitle}"? Это действие нельзя отменить.`)) return
    await deleteProduct(productId)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="btn btn-secondary px-4 text-red-600 hover:bg-red-50"
      title="Удалить товар"
    >
      🗑️
    </button>
  )
}
