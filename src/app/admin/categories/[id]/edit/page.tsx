import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import CategoryForm from '../../CategoryForm'

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const isAuth = await checkAdminAuth()
  if (!isAuth) redirect('/admin/login')

  const category = await prisma.productCategory.findUnique({
    where: { id: params.id }
  })

  if (!category) redirect('/admin/categories')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-graphite mb-2">Редактировать категорию</h2>
        <p className="text-graphite/60">{category.name}</p>
      </div>
      <CategoryForm category={category} />
    </div>
  )
}
