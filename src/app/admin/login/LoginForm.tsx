'use client'

import { useState } from 'react'
import { loginAdmin } from './actions'

export default function LoginForm() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await loginAdmin(formData)
      
      if (!result.success) {
        setError(result.error || 'Ошибка входа')
      }
    } catch (err) {
      setError('Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-graphite">
          Логин
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          className="input"
          placeholder="admin"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-graphite">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  )
}

