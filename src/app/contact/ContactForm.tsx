'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

type Result = { success: boolean; error?: string } | void

export default function ContactForm({
  action,
  subjects
}: {
  action: (formData: FormData) => Promise<Result>
  subjects: Record<string, string>
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    if (isPending) return
    setError(null)
    startTransition(async () => {
      const result = await action(formData)
      if (result && !result.success) {
        setError(result.error ?? 'Не удалось отправить сообщение')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4" aria-busy={isPending}>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-graphite">
          Ваше имя *
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className="input" placeholder="Иван Иванов" />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-graphite">
          Email *
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="ivan@example.com" />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-graphite">
          Телефон
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" placeholder="+7 (900) 123-45-67" />
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-graphite">
          Тема обращения *
        </label>
        <select id="subject" name="subject" required className="select" defaultValue="">
          <option value="" disabled>Выберите тему</option>
          {Object.entries(subjects).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-graphite">
          Сообщение *
        </label>
        <textarea id="message" name="message" required className="textarea" placeholder="Расскажите, чем мы можем вам помочь..." />
      </div>

      <label className="flex items-start gap-3 text-sm text-graphite/80 cursor-pointer">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-moss" />
        <span>
          Я согласен(на) на{' '}
          <Link href="/privacy" target="_blank" className="text-moss underline hover:no-underline">
            обработку персональных данных
          </Link>
          {' '}*
        </span>
      </label>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn btn-primary w-full disabled:opacity-60">
        {isPending ? 'Отправляем...' : 'Отправить сообщение'}
      </button>

      <p className="text-xs text-graphite/60 text-center">
        Мы ответим вам в течение 1-2 рабочих дней
      </p>
    </form>
  )
}
