'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  try {
    const title = formData.get('title')?.toString()
    const subtitle = formData.get('subtitle')?.toString() || undefined
    const description = formData.get('description')?.toString()
    const category = formData.get('category')?.toString() as any
    const material = formData.get('material')?.toString() as any
    const price = Number(formData.get('price')) * 100 // конвертируем в копейки
    const warmth = formData.get('warmth')?.toString() as any || undefined
    const pattern = formData.get('pattern')?.toString() as any || undefined
    const color = formData.get('color')?.toString() || undefined
    const slug = formData.get('slug')?.toString()
    
    const images = JSON.parse(formData.get('images')?.toString() || '[]')
    const sizes = JSON.parse(formData.get('sizes')?.toString() || '[]')

    if (!title || !description || !category || !material || !slug) {
      throw new Error('Заполните все обязательные поля')
    }

    await prisma.product.create({
      data: {
        title,
        subtitle,
        description,
        category,
        material,
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
    const material = formData.get('material')?.toString() as any
    const price = Number(formData.get('price')) * 100
    const warmth = formData.get('warmth')?.toString() as any || null
    const pattern = formData.get('pattern')?.toString() as any || null
    const color = formData.get('color')?.toString() || null
    const slug = formData.get('slug')?.toString()
    
    const images = JSON.parse(formData.get('images')?.toString() || '[]')
    const sizes = JSON.parse(formData.get('sizes')?.toString() || '[]')

    if (!title || !description || !category || !material || !slug) {
      throw new Error('Заполните все обязательные поля')
    }

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
        material,
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

