import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const isAuth = await checkAdminAuth()
  
  if (!isAuth) {
    redirect('/admin/login')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-graphite mb-2">Новый товар</h2>
        <p className="text-graphite/60">Добавьте информацию о товаре</p>
      </div>

      <ProductForm />
    </div>
  )
}

