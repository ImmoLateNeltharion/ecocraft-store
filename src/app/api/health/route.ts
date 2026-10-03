import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Healthcheck для docker compose / мониторинга: проверяет и приложение, и базу
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'db unavailable' }, { status: 503 })
  }
}
