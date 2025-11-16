import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export const runtime = 'nodejs'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
}

export async function GET(
  _request: Request,
  { params }: { params: { path?: string[] | string } }
) {
  const baseDir = path.join(process.cwd(), 'public', 'images', 'products')
  const segments = Array.isArray(params.path)
    ? params.path
    : params.path
    ? [params.path]
    : []

  const safeRelativePath = path
    .join(...segments)
    .replace(/\\/g, '/')
    .replace(/^(\.\.(\/|\\|$))+/, '')

  const absolutePath = path.join(baseDir, safeRelativePath)

  if (!absolutePath.startsWith(baseDir)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const fileBuffer = await fs.readFile(absolutePath)
    const ext = path.extname(absolutePath).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}


