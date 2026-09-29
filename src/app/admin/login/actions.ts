'use server'

import { prisma } from '@/lib/db'
import { createAdminSession, hashPassword, isPasswordHashed, verifyPassword } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAdmin(formData: FormData) {
  const username = formData.get('username')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!username || !password) {
    return { success: false, error: 'Заполните все поля' }
  }

  let adminId: string | null = null

  try {
    const admin = await prisma.admin.findUnique({ where: { username } })

    if (admin) {
      let ok = false

      if (isPasswordHashed(admin.password)) {
        ok = await verifyPassword(password, admin.password)
      } else {
        // Старая запись с паролем открытым текстом: проверяем и сразу хешируем
        ok = admin.password === password
        if (ok) {
          await prisma.admin.update({
            where: { id: admin.id },
            data: { password: await hashPassword(password) }
          })
        }
      }

      if (ok) {
        adminId = admin.id
      }
    }

    if (!adminId) {
      return { success: false, error: 'Неверный логин или пароль' }
    }

    await createAdminSession(adminId)
  } catch (error) {
    console.error('Ошибка входа:', error)
    return { success: false, error: 'Произошла ошибка' }
  }

  // redirect() бросает специальное исключение, поэтому вызываем вне try/catch
  redirect('/admin')
}
