import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProductForm from '../../ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const isAuth = await checkAdminAuth()
  if (!isAuth) redirect('/admin/login')

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true, sizes: true }
    }),
    prisma.productCategory.findMany({ orderBy: { order: 'asc' } })
  ])

  if (!product) redirect('/admin/products')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-graphite mb-2">Редактировать товар</h2>
        <p className="text-graphite/60">{product.title}</p>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  )
}
