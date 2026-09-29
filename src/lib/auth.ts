import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SEC = 60 * 60 * 24 * 7 // 7 дней

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function isPasswordHashed(value: string) {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$')
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_SEC * 1000)

  await prisma.adminSession.create({ data: { token, adminId, expiresAt } })

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SEC
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } })
  }
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: { select: { id: true, username: true } } }
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return { adminId: session.admin.id, username: session.admin.username }
}

export async function checkAdminAuth() {
  return (await getAdminSession()) !== null
}

/** Для server actions админки: бросает ошибку, если нет валидной сессии */
export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
