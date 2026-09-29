import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Политика конфиденциальности — ${SITE.name}`,
  robots: { index: false }
}

export default function PrivacyPage() {
  return (
    <div className="container py-8">
      <article className="max-w-3xl mx-auto card p-8 space-y-6 text-graphite/80 leading-relaxed">
        <h1 className="text-3xl font-serif text-graphite">Политика конфиденциальности</h1>
        <p className="text-sm text-graphite/60">Редакция от 29 сентября 2026 г.</p>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">1. Общие положения</h2>
          <p>
            Настоящая политика определяет порядок обработки и защиты персональных данных
            пользователей сайта {SITE.url} (далее — Сайт). Оператор персональных данных:
            {' '}{SITE.legal.entity}, ИНН {SITE.legal.inn}, ОГРНИП {SITE.legal.ogrnip},
            адрес: {SITE.legal.address} (далее — Оператор).
          </p>
          <p>
            Используя Сайт и отправляя формы, пользователь даёт согласие на обработку своих
            персональных данных в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
            «О персональных данных».
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">2. Какие данные мы собираем</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>имя, номер телефона, адрес электронной почты;</li>
            <li>адрес доставки и комментарий к заказу;</li>
            <li>состав и история заказов;</li>
            <li>текст сообщений, отправленных через форму обратной связи;</li>
            <li>технические данные: IP-адрес, тип браузера, cookie (в том числе содержимое корзины).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">3. Цели обработки</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>оформление, оплата и доставка заказов;</li>
            <li>связь с покупателем по вопросам заказа;</li>
            <li>ответы на обращения через форму обратной связи;</li>
            <li>выполнение требований законодательства РФ.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">4. Передача данных третьим лицам</h2>
          <p>
            Данные передаются только в объёме, необходимом для исполнения заказа: платёжному
            сервису ЮKassa (ООО НКО «ЮМани») для приёма оплаты и службам доставки для передачи
            отправления. Оператор не продаёт и не передаёт персональные данные иным лицам,
            кроме случаев, предусмотренных законом.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">5. Хранение и защита</h2>
          <p>
            Данные хранятся на серверах, расположенных на территории РФ, и защищены
            организационными и техническими мерами. Данные заказов хранятся в течение
            срока, необходимого для исполнения обязательств и требований бухгалтерского
            учёта, после чего удаляются или обезличиваются.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">6. Права пользователя</h2>
          <p>
            Пользователь вправе запросить уточнение, блокирование или удаление своих
            персональных данных, а также отозвать согласие на их обработку, направив
            запрос на {SITE.email}. Оператор отвечает на запрос в течение 10 рабочих дней.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">7. Контакты</h2>
          <p>
            По вопросам обработки персональных данных: {SITE.email}, {SITE.phone}.
          </p>
        </section>
      </article>
    </div>
  )
}
