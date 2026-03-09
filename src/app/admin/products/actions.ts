'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Только a-z, цифры, дефисы; без пробелов, кириллицы, спецсимволов
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

// Зарезервированные пути Next.js и сайта
const RESERVED_SLUGS = new Set([
  'new', 'edit', 'admin', 'api', 'catalog', 'cart',
  'checkout', 'product', 'orders', 'about', 'contact',
  'login', 'logout', 'uploads', 'images', 'favicon', 'robots',
  'sitemap', 'null', 'undefined', 'true', 'false'
])

function validateSlug(slug: string): string | null {
  if (!slug || slug.trim() === '') return 'Slug не может быть пустым'
  if (slug.length < 2) return 'Slug слишком короткий (минимум 2 символа)'
  if (slug.length > 100) return 'Slug слишком длинный (максимум 100 символов)'
  if (/\s/.test(slug)) return 'Slug содержит пробелы — замените их на дефисы (-)'
  if (/[А-Яа-яЁё]/.test(slug)) return 'Slug содержит кириллицу — используйте только латиницу a-z'
  if (/[A-Z]/.test(slug)) return 'Slug содержит заглавные буквы — используйте только строчные'
  if (slug.startsWith('-') || slug.endsWith('-')) return 'Slug не может начинаться или заканчиваться дефисом'
  if (/--/.test(slug)) return 'Slug не может содержать два дефиса подряд (--)'
  if (!SLUG_REGEX.test(slug)) return 'Slug содержит недопустимые символы. Только: a-z, 0-9, дефис (-)'
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" — зарезервированное слово, выберите другой slug`
  return null
}

export async function createProduct(formData: FormData) {
  try {
    const title = formData.get('title')?.toString()
    const subtitle = formData.get('subtitle')?.toString() || undefined
    const description = formData.get('description')?.toString()
    const category = formData.get('category')?.toString() as any
    const materials = JSON.parse(formData.get('materials')?.toString() || '[]')
    const price = Number(formData.get('price')) * 100 // конвертируем в копейки
    const warmth = formData.get('warmth')?.toString() as any || undefined
    const pattern = formData.get('pattern')?.toString() as any || undefined
    const color = formData.get('color')?.toString() || undefined
    const slug = formData.get('slug')?.toString()
    
    const images = JSON.parse(formData.get('images')?.toString() || '[]')
    const sizes = JSON.parse(formData.get('sizes')?.toString() || '[]')

    if (!title || !description || !category || !slug || !Array.isArray(materials) || materials.length === 0) {
      throw new Error('Заполните все обязательные поля')
    }

    const slugError = validateSlug(slug)
    if (slugError) throw new Error(slugError)

    // Проверяем уникальность slug
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) throw new Error(`Slug "${slug}" уже используется другим товаром`)

    await prisma.product.create({
      data: {
        title,
        subtitle,
        description,
        category,
        materials,
        price,
        warmth,
        pattern,
        color,
        slug,
        images: {
          create: images.map((url: string) => ({
            url,
            alt: title
          }))
        },
        sizes: {
          create: sizes.map((s: any) => ({
            label: s.label,
            inStock: s.inStock
          }))
        }
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/catalog')
    revalidatePath('/')
    
    redirect('/admin/products')
  } catch (error) {
    console.error('Ошибка создания товара:', error)
    throw error
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const title = formData.get('title')?.toString()
    const subtitle = formData.get('subtitle')?.toString() || null
    const description = formData.get('description')?.toString()
    const category = formData.get('category')?.toString() as any
    const materials = JSON.parse(formData.get('materials')?.toString() || '[]')
    const price = Number(formData.get('price')) * 100
    const warmth = formData.get('warmth')?.toString() as any || null
    const pattern = formData.get('pattern')?.toString() as any || null
    const color = formData.get('color')?.toString() || null
    const slug = formData.get('slug')?.toString()
    
    const images = JSON.parse(formData.get('images')?.toString() || '[]')
    const sizes = JSON.parse(formData.get('sizes')?.toString() || '[]')

    if (!title || !description || !category || !slug || !Array.isArray(materials) || materials.length === 0) {
      throw new Error('Заполните все обязательные поля')
    }

    const slugError = validateSlug(slug)
    if (slugError) throw new Error(slugError)

    // Проверяем уникальность slug (исключая текущий товар)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing && existing.id !== productId) throw new Error(`Slug "${slug}" уже используется другим товаром`)

    // Удаляем старые изображения и размеры
    await prisma.image.deleteMany({ where: { productId } })
    await prisma.size.deleteMany({ where: { productId } })

    // Обновляем товар
    await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        subtitle,
        description,
        category,
        materials,
        price,
        warmth,
        pattern,
        color,
        slug,
        images: {
          create: images.map((url: string) => ({
            url,
            alt: title
          }))
        },
        sizes: {
          create: sizes.map((s: any) => ({
            label: s.label,
            inStock: s.inStock
          }))
        }
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/catalog')
    revalidatePath(`/product/${slug}`)
    revalidatePath('/')
    
    redirect('/admin/products')
  } catch (error) {
    console.error('Ошибка обновления товара:', error)
    throw error
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId }
    })

    revalidatePath('/admin/products')
    revalidatePath('/catalog')
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка удаления товара:', error)
    return { success: false, error: 'Не удалось удалить товар' }
  }
}

