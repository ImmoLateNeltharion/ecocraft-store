import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import { checkAdminAuth } from '@/lib/auth'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
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

  // В некоторых окружениях проверка instanceof File может не работать.
  if (!file || typeof (file as any).arrayBuffer !== 'function') {
    return NextResponse.json(
      { success: false, error: 'Файл не получен' },
      { status: 400 }
    )
  }

  const f: any = file as any

  if (f.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: 'Файл превышает 10MB' },
      { status: 400 }
    )
  }

  if (!ALLOWED_MIME.has(f.type)) {
    return NextResponse.json(
      { success: false, error: 'Недопустимый формат файла' },
      { status: 400 }
    )
  }

  const arrayBuffer = await f.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const safeExt = getExtension(f.name) || '.jpg'
  const fileName = `${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')}-${randomUUID()}${safeExt}`

  // Сохраняем в public/images/products, чтобы URL совпадал со старыми данными
  const uploadDir = path.join(process.cwd(), 'public', 'images', 'products')
  const fullPath = path.join(uploadDir, fileName)

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(fullPath, buffer)

  const url = `/images/products/${fileName}`

  return NextResponse.json({ success: true, url })
}
