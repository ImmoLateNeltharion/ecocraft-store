import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-moss/10 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-graphite">
          Заказ успешно оформлен!
        </h1>

        <div className="card p-8 space-y-4 text-left">
          <p className="text-graphite/70">
            Спасибо за ваш заказ! Мы получили вашу заявку и скоро свяжемся с вами 
            для подтверждения деталей.
          </p>
          <p className="text-graphite/70">
            Обычно мы обрабатываем заказы в течение 1-2 рабочих дней. 
            Вы получите уведомление на указанный email.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/" className="btn btn-primary">
            На главную
          </Link>
          <Link href="/catalog" className="btn btn-secondary">
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  )
}

