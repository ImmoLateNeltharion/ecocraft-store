import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import DeleteCategoryButton from './DeleteCategoryButton'

export default async function CategoriesPage() {
  const isAuth = await checkAdminAuth()
  if (!isAuth) redirect('/admin/login')

  const categories = await prisma.productCategory.findMany({
    orderBy: { order: 'asc' }
  })

  // Считаем товары в каждой категории
  const counts = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true }
  })
  const countMap = Object.fromEntries(counts.map(c => [c.category, c._count.id]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-graphite">Категории</h2>
          <p className="text-graphite/60 text-sm mt-1">Управление разделами каталога</p>
        </div>
        <Link href="/admin/categories/new" className="btn btn-primary">
          + Добавить категорию
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-graphite/60 mb-4">Категорий пока нет</p>
          <Link href="/admin/categories/new" className="btn btn-primary">
            Создать первую категорию
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-sand/50 border-b border-graphite/10">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-graphite">Название</th>
                <th className="text-left p-4 text-sm font-medium text-graphite">ID</th>
                <th className="text-center p-4 text-sm font-medium text-graphite">Порядок</th>
                <th className="text-center p-4 text-sm font-medium text-graphite">Товаров</th>
                <th className="text-right p-4 text-sm font-medium text-graphite">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite/5">
              {categories.map(cat => {
                const productCount = countMap[cat.id] ?? 0

                return (
                  <tr key={cat.id} className="hover:bg-sand/20 transition">
                    <td className="p-4 font-medium text-graphite">{cat.name}</td>
                    <td className="p-4">
                      <code className="text-xs bg-sand px-2 py-1 rounded text-graphite/70">{cat.id}</code>
                    </td>
                    <td className="p-4 text-center text-graphite/60">{cat.order}</td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-medium ${productCount > 0 ? 'text-moss' : 'text-graphite/40'}`}>
                        {productCount}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/categories/${cat.id}/edit`}
                          className="btn btn-secondary text-sm px-3 py-1"
                        >
                          Изменить
                        </Link>
                        {productCount === 0 && (
                          <DeleteCategoryButton categoryId={cat.id} categoryName={cat.name} />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="card p-4 bg-blue-50/50 border border-blue-200/50">
        <p className="text-sm text-graphite/70">
          💡 Категории с товарами нельзя удалить. Сначала переназначьте товары в другую категорию.
        </p>
      </div>
    </div>
  )
}
