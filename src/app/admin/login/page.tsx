import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/lib/auth'
import LoginForm from './LoginForm'

export default async function AdminLoginPage() {
  const isAuth = await checkAdminAuth()
  
  if (isAuth) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-moss/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-serif text-graphite mb-2">
              Админ панель
            </h1>
            <p className="text-graphite/60">
              Долина снов Аниэль
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

