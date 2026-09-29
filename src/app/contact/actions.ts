'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { notifyOwner } from '@/lib/notify'
import { CONTACT_SUBJECTS } from '@/lib/site'

const ContactSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(100),
  email: z.string().trim().email('Укажите корректный email').max(200),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().refine((s) => s in CONTACT_SUBJECTS, 'Выберите тему'),
  message: z.string().trim().min(5, 'Напишите сообщение').max(3000),
  consent: z.literal('on', { errorMap: () => ({ message: 'Нужно согласие на обработку персональных данных' }) })
})

export async function sendContactMessage(formData: FormData) {
  const parsed = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    subject: formData.get('subject'),
    message: formData.get('message'),
    consent: formData.get('consent')
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Проверьте заполнение формы' }
  }

  const { consent: _consent, ...data } = parsed.data

  try {
    await prisma.contactMessage.create({ data })
  } catch (error) {
    console.error('❌ Не удалось сохранить сообщение:', error)
    return { success: false, error: 'Не удалось отправить сообщение. Напишите нам на почту.' }
  }

  await notifyOwner(
    `✉️ Сообщение с сайта: ${CONTACT_SUBJECTS[data.subject]}\n` +
    `От: ${data.name}, ${data.email}${data.phone ? `, ${data.phone}` : ''}\n\n` +
    data.message
  )

  redirect('/contact?sent=1')
}
