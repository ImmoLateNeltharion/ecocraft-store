import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const isAuth = await checkAdminAuth()
  if (!isAuth) redirect('/admin/login')

  const categories = await prisma.productCategory.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-graphite mb-2">Новый товар</h2>
        <p className="text-graphite/60">Добавьте информацию о товаре</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
