import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import { checkAdminAuth } from '@/lib/auth'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function getExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase()
  if (!ext) return ''
  return ext.replace(/[^a-z0-9.]/g, '')
}

export async function POST(request: Request) {
  const isAuth = await checkAdminAuth()

  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: 'Файл не получен' },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: 'Файл превышает 10MB' },
      { status: 400 }
    )
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { success: false, error: 'Недопустимый формат файла' },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const safeExt = getExtension(file.name) || '.jpg'
  const fileName = `${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')}-${randomUUID()}${safeExt}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const fullPath = path.join(uploadDir, fileName)

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(fullPath, buffer)

  const url = `/uploads/${fileName}`

  return NextResponse.json({ success: true, url })
}

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Файл должен быть изображением' }, { status: 400 })
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const filename = `product-${timestamp}-${randomStr}.${extension}`

    // Создаем директорию если не существует
    const uploadDir = join(process.cwd(), 'public', 'images', 'products')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Возвращаем URL
    const url = `/images/products/${filename}`
    return NextResponse.json({ url, success: true })
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 })
  }
}

