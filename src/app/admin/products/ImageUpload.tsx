'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageUpload({ 
  onUpload 
}: { 
  onUpload: (url: string) => void 
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Показываем preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Загружаем файл
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onUpload(data.url)
      } else {
        alert('Ошибка загрузки: ' + (data.error || 'Неизвестная ошибка'))
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-graphite/20 rounded-lg p-6 hover:border-moss transition">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="image-upload"
      />
      
      <label 
        htmlFor="image-upload" 
        className="cursor-pointer flex flex-col items-center gap-3"
      >
        {preview ? (
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <>
            <svg className="w-12 h-12 text-graphite/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-center">
              <p className="text-sm text-graphite/70">
                {isUploading ? 'Загрузка...' : 'Нажмите для загрузки изображения'}
              </p>
              <p className="text-xs text-graphite/50 mt-1">
                PNG, JPG, WebP до 10MB
              </p>
            </div>
          </>
        )}
      </label>
    </div>
  )
}

