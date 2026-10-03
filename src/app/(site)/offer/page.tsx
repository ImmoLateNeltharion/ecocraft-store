import type { Metadata } from 'next'
import { SITE, legalLine } from '@/lib/site'

export const metadata: Metadata = {
  title: `Публичная оферта — ${SITE.name}`,
  robots: { index: false }
}

export default function OfferPage() {
  return (
    <div className="container py-8">
      <article className="max-w-3xl mx-auto card p-8 space-y-6 text-graphite/80 leading-relaxed">
        <h1 className="text-3xl font-serif text-graphite">Публичная оферта</h1>
        <p className="text-sm text-graphite/60">Редакция от 29 сентября 2026 г.</p>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">1. Общие положения</h2>
          <p>
            Настоящий документ является публичной офертой {legalLine() || `владельца сайта «${SITE.name}»`}
            (далее — Продавец) в соответствии
            со ст. 437 Гражданского кодекса РФ и определяет условия розничной купли-продажи товаров
            через сайт {SITE.url} (далее — Сайт).
          </p>
          <p>
            Оформление заказа на Сайте и его оплата означают полное и безоговорочное принятие
            условий настоящей оферты покупателем (акцепт).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">2. Предмет оферты</h2>
          <p>
            Продавец обязуется передать покупателю товар (одеяла, пледы, сумки и иные изделия
            ручной работы), представленный на Сайте, а покупатель — принять и оплатить его на
            условиях настоящей оферты. Изделия выполняются вручную, поэтому оттенок, фактура и
            размеры могут незначительно отличаться от фотографий (в пределах ±3 см).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">3. Оформление заказа и оплата</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Заказ оформляется через корзину на Сайте с указанием контактных данных и адреса.</li>
            <li>Цены указаны в рублях РФ и не включают стоимость доставки.</li>
            <li>Оплата производится онлайн через платёжный сервис ЮKassa. Заказ считается принятым после поступления оплаты.</li>
            <li>Продавец вправе отменить заказ и вернуть оплату, если товар отсутствует в наличии, уведомив покупателя.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">4. Доставка</h2>
          <p>
            Доставка осуществляется по России пунктами выдачи (CDEK, Boxberry), курьером или
            Почтой России. Стоимость и срок доставки Продавец согласует с покупателем после
            оплаты заказа по телефону или email. Ориентировочный срок — от 3 до 7 рабочих дней
            с момента отправки. Риск случайной гибели товара переходит к покупателю в момент
            передачи товара.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">5. Возврат и обмен</h2>
          <p>
            Возврат товара надлежащего качества возможен в течение 7 дней с момента получения,
            если сохранены товарный вид, потребительские свойства и упаковка (ст. 26.1 Закона
            РФ «О защите прав потребителей»). Изделия, изготовленные по индивидуальным
            параметрам покупателя, возврату не подлежат. Товар ненадлежащего качества
            заменяется или его стоимость возвращается в порядке, установленном законом.
            Возврат денежных средств производится тем же способом, которым была произведена оплата,
            в течение 10 дней с момента получения возвращённого товара.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">6. Прочие условия</h2>
          <p>
            Продавец вправе изменять условия оферты; новая редакция действует с момента
            публикации на Сайте и не распространяется на уже оплаченные заказы. Персональные
            данные обрабатываются в соответствии с Политикой конфиденциальности.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-graphite">7. Реквизиты Продавца</h2>
          <p>
            {SITE.legal.entity && <>{SITE.legal.entity}<br /></>}
            {SITE.legal.inn && <>ИНН {SITE.legal.inn}<br /></>}
            {SITE.legal.ogrnip && <>ОГРНИП {SITE.legal.ogrnip}<br /></>}
            {SITE.legal.address && <>Адрес: {SITE.legal.address}<br /></>}
            Email: {SITE.email}, телефон: {SITE.phone}
          </p>
        </section>
      </article>
    </div>
  )
}
