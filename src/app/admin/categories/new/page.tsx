import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import CategoryForm from '../CategoryForm'

export default async function NewCategoryPage() {
  const isAuth = await checkAdminAuth()
  if (!isAuth) redirect('/admin/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-graphite mb-2">Новая категория</h2>
        <p className="text-graphite/60">Добавьте раздел каталога</p>
      </div>
      <CategoryForm />
    </div>
  )
}
