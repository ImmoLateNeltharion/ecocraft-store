'use server'

import { prisma } from '@/lib/db'
import { setAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAdmin(formData: FormData) {
  try {
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()
    
    if (!username || !password) {
      return { success: false, error: 'Заполните все поля' }
    }

    // Находим админа
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return { success: false, error: 'Неверный логин или пароль' }
    }

    // В продакшене используйте bcrypt для хеширования паролей!
    // Сейчас для простоты проверяем напрямую
    if (admin.password !== password) {
      return { success: false, error: 'Неверный логин или пароль' }
    }

    // Создаём сессию
    await setAdminSession(admin.id)
    
    // Редирект
    redirect('/admin')
  } catch (error) {
    console.error('Ошибка входа:', error)
    return { success: false, error: 'Произошла ошибка' }
  }
}

