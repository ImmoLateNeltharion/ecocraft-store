import { cookies } from 'next/headers'
import { prisma } from './db'

const ADMIN_SESSION_COOKIE = 'admin_session'

export async function getAdminSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  
  if (!sessionId) {
    return null
  }
  
  // В простой версии просто проверяем наличие куки
  // В продакшене нужно использовать JWT или сессии в БД
  return { id: sessionId }
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, adminId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 дней
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function checkAdminAuth() {
  const session = await getAdminSession()
  if (!session) {
    return false
  }
  
  // Проверяем существование админа
  const admin = await prisma.admin.findFirst({
    where: { id: session.id }
  })
  
  return !!admin
}

