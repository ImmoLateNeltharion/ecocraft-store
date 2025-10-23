export default function ContactPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    }

    // Здесь можно добавить отправку на email
    console.log('Новое сообщение:', contactData)
    
    // В реальном приложении здесь будет редирект на страницу успеха
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif text-graphite">
            Контакты
          </h1>
          <p className="text-lg text-graphite/70">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Контактная информация */}
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-medium text-graphite">
                Наши контакты
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-moss/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-graphite/60">Email</div>
                    <a href="mailto:info@snovaniel.ru" className="text-moss hover:underline">
                      info@snovaniel.ru
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-moss/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-graphite/60">Телефон</div>
                    <a href="tel:+79001234567" className="text-moss hover:underline">
                      +7 (900) 123-45-67
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-moss/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-graphite/60">Режим работы</div>
                    <div className="text-graphite">Пн-Пт: 10:00 - 19:00</div>
                    <div className="text-graphite">Сб-Вс: 11:00 - 17:00</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-medium text-graphite">
                Мы в соцсетях
              </h2>
              <div className="flex gap-3">
                <a 
                  href="https://vk.com/dolinasnova5342" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-moss/10 rounded-lg flex items-center justify-center hover:bg-moss/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-moss" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.45 14.98c-.28.28-.59.43-.91.43-.6 0-1.03-.47-1.69-1.17-.5-.53-.96-1.01-1.45-1.01-.08 0-.16.01-.24.04-.47.13-.77.74-.77 1.65 0 .43-.35.78-.78.78h-1.12c-.77 0-3.12-.13-5.06-2.15-2.38-2.47-4.47-7.4-4.49-7.45a.78.78 0 01.73-1.06h2.37c.41 0 .76.28.86.68.12.48 1.02 2.84 2.47 4.51.37.43.68.64.93.64.13 0 .25-.04.36-.13.49-.4.39-1.88.37-2.24v-.01c-.04-.75-.05-1.33-.52-1.71-.24-.19-.4-.32-.4-.61 0-.32.26-.58.58-.58h3.5c.3 0 .55.25.55.58v3.86c0 .3.14.38.23.38.13 0 .3-.08.6-.38 1.78-1.98 3.05-5.03 3.05-5.03.11-.23.34-.39.6-.39h2.37c.51 0 .88.5.73.99-.51 1.64-3.72 6.28-3.86 6.48-.11.15-.16.25-.16.35 0 .08.04.16.13.25.07.07.71.65 1.08 1.06.91.99 1.61 1.82 1.8 2.39.18.58-.13 1.08-.71 1.08h-2.37c-.3 0-.58-.15-.76-.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div className="card p-6">
            <h2 className="text-xl font-medium text-graphite mb-6">
              Напишите нам
            </h2>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-graphite">
                  Ваше имя *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-graphite">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="ivan@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-graphite">
                  Телефон
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+7 (900) 123-45-67"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-graphite">
                  Тема обращения *
                </label>
                <select id="subject" name="subject" required className="select">
                  <option value="">Выберите тему</option>
                  <option value="order">Вопрос по заказу</option>
                  <option value="custom">Индивидуальный заказ</option>
                  <option value="wholesale">Оптовые закупки</option>
                  <option value="cooperation">Сотрудничество</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-graphite">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  className="textarea"
                  placeholder="Расскажите, чем мы можем вам помочь..."
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Отправить сообщение
              </button>

              <p className="text-xs text-graphite/60 text-center">
                Мы ответим вам в течение 1-2 рабочих дней
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

