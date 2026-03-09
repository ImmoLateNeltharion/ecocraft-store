'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateId(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-ZА-ЯЁ0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[А-ЯЁ]/g, (c) => {
      const map: Record<string, string> = {
        А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ё:'YO',Ж:'ZH',З:'Z',И:'I',Й:'Y',
        К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',
        Х:'KH',Ц:'TS',Ч:'CH',Ш:'SH',Щ:'SCH',Ъ:'',Ы:'Y',Ь:'',Э:'E',Ю:'YU',Я:'YA'
      }
      return map[c] || c
    })
    || Date.now().toString()
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name')?.toString().trim()
  const order = Number(formData.get('order') || 0)

  if (!name) throw new Error('Название категории обязательно')

  const id = generateId(name)

  await prisma.productCategory.create({
    data: { id, name, slug: id, order }
  })

  revalidatePath('/admin/categories')
  revalidatePath('/catalog')
  revalidatePath('/')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name')?.toString().trim()
  const order = Number(formData.get('order') || 0)

  if (!name) throw new Error('Название категории обязательно')

  await prisma.productCategory.update({
    where: { id },
    data: { name, order }
  })

  revalidatePath('/admin/categories')
  revalidatePath('/catalog')
  revalidatePath('/')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { category: id } })
  if (count > 0) {
    return { success: false, error: `Нельзя удалить: в категории ${count} товаров` }
  }

  await prisma.productCategory.delete({ where: { id } })

  revalidatePath('/admin/categories')
  revalidatePath('/catalog')
  revalidatePath('/')
  return { success: true }
}
