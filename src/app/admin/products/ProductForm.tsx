'use client'

import { useState } from 'react'
import { createProduct, updateProduct } from './actions'
import { Product, Image as PrismaImage, Size } from '@prisma/client'

type ProductWithRelations = Product & {
  images: PrismaImage[]
  sizes: Size[]
}

export default function ProductForm({ 
  product 
}: { 
  product?: ProductWithRelations
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images.map(img => img.url) || ['']
  )
  const [sizes, setSizes] = useState<Array<{ label: string; inStock: number }>>(
    product?.sizes.map(s => ({ label: s.label, inStock: s.inStock })) || [{ label: '', inStock: 0 }]
  )

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    try {
      // Добавляем изображения и размеры в FormData
      formData.set('images', JSON.stringify(imageUrls.filter(url => url)))
      formData.set('sizes', JSON.stringify(sizes.filter(s => s.label)))
      
      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function addImageUrl() {
    setImageUrls([...imageUrls, ''])
  }

  function removeImageUrl(index: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  function updateImageUrl(index: number, value: string) {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  function addSize() {
    setSizes([...sizes, { label: '', inStock: 0 }])
  }

  function removeSize(index: number) {
    setSizes(sizes.filter((_, i) => i !== index))
  }

  function updateSize(index: number, field: 'label' | 'inStock', value: string | number) {
    const newSizes = [...sizes]
    if (field === 'label') {
      newSizes[index].label = value as string
    } else {
      newSizes[index].inStock = Number(value)
    }
    setSizes(newSizes)
  }

  return (
    <form action={handleSubmit} className="card p-6 space-y-6">
      {/* Основная информация */}
      <div className="space-y-4">
        <h3 className="font-medium text-graphite">Основная информация</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Название *
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={product?.title}
              className="input"
              placeholder="Плед льняной Классика"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Подзаголовок
            </label>
            <input
              name="subtitle"
              type="text"
              defaultValue={product?.subtitle || ''}
              className="input"
              placeholder="120×180 см, светло-серый"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-graphite">
            Описание *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={product?.description}
            className="textarea"
            placeholder="Подробное описание товара..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Категория *
            </label>
            <select name="category" required defaultValue={product?.category} className="select">
              <option value="BLANKET">Одеяло</option>
              <option value="SHOPPER">Шопер</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Материал *
            </label>
            <select name="material" required defaultValue={product?.material} className="select">
              <option value="LINEN">Лён</option>
              <option value="COTTON">Хлопок</option>
              <option value="WOOL">Шерсть</option>
              <option value="BAMBOO">Бамбук</option>
              <option value="NETTLE">Крапива</option>
              <option value="MUSLIN">Муслин</option>
              <option value="FLANNEL">Фланель</option>
              <option value="TENCEL">Tencel</option>
              <option value="RECYCLED">Переработанное</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Цена (₽) *
            </label>
            <input
              name="price"
              type="number"
              required
              min="0"
              defaultValue={product ? product.price / 100 : ''}
              className="input"
              placeholder="5990"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Теплота
            </label>
            <select name="warmth" defaultValue={product?.warmth || ''} className="select">
              <option value="">Не указано</option>
              <option value="LIGHT">Легкое</option>
              <option value="MEDIUM">Среднее</option>
              <option value="WARM">Теплое</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Узор
            </label>
            <select name="pattern" defaultValue={product?.pattern || ''} className="select">
              <option value="">Не указано</option>
              <option value="SOLID">Однотонное</option>
              <option value="STRIPED">Полосатое</option>
              <option value="CHECKERED">Клетчатое</option>
              <option value="GEOMETRIC">Геометрическое</option>
              <option value="FLORAL">Цветочное</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-graphite">
              Цвет
            </label>
            <input
              name="color"
              type="text"
              defaultValue={product?.color || ''}
              className="input"
              placeholder="Светло-серый"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-graphite">
            Slug (URL) *
          </label>
          <input
            name="slug"
            type="text"
            required
            defaultValue={product?.slug}
            className="input"
            placeholder="linen-blanket-classic"
            pattern="[a-z0-9-]+"
          />
          <p className="text-xs text-graphite/60">Только маленькие буквы, цифры и дефисы</p>
        </div>
      </div>

      {/* Изображения */}
      <div className="space-y-4 pt-6 border-t border-graphite/10">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-graphite">Изображения</h3>
          <button type="button" onClick={addImageUrl} className="text-sm text-moss hover:underline">
            + Добавить изображение
          </button>
        </div>

        <div className="space-y-3">
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => updateImageUrl(index, e.target.value)}
                className="input flex-1"
                placeholder="/images/product-1.jpg"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  className="btn btn-secondary px-4 text-red-600 hover:bg-red-50"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Размеры и наличие */}
      <div className="space-y-4 pt-6 border-t border-graphite/10">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-graphite">Размеры и наличие</h3>
          <button type="button" onClick={addSize} className="text-sm text-moss hover:underline">
            + Добавить размер
          </button>
        </div>

        <div className="space-y-3">
          {sizes.map((size, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={size.label}
                onChange={(e) => updateSize(index, 'label', e.target.value)}
                className="input flex-1"
                placeholder="120×180 см"
              />
              <input
                type="number"
                value={size.inStock}
                onChange={(e) => updateSize(index, 'inStock', e.target.value)}
                className="input w-32"
                placeholder="В наличии"
                min="0"
              />
              {sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="btn btn-secondary px-4 text-red-600 hover:bg-red-50"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 pt-6 border-t border-graphite/10">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {isLoading ? 'Сохранение...' : product ? 'Сохранить изменения' : 'Создать товар'}
        </button>
        <a href="/admin/products" className="btn btn-secondary">
          Отмена
        </a>
      </div>
    </form>
  )
}

