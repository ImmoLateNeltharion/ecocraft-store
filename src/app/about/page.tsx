import Badge from '@/components/Badge'

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif text-graphite">
            О нас
          </h1>
          <p className="text-lg text-graphite/70 max-w-2xl mx-auto">
            История бренда, наши ценности и традиции русского ремесленного искусства
          </p>
        </div>

        {/* История */}
        <section className="card p-8 space-y-4">
          <h2 className="text-2xl font-serif text-graphite">Наша история</h2>
          <div className="prose prose-lg max-w-none text-graphite/70 space-y-4">
            <p>
              «Долина снов Анэль» — это союз роскоши и природной гармонии. Мы создаём текстиль, где
              каждая деталь говорит о вкусе, а каждое прикосновение дарит подлинный комфорт.
            </p>
            <p>
              Наша идея проста: настоящая роскошь — в естественности. В эпоху синтетики мы возвращаем
              людям радость от натуральных тканей и ручной работы.
            </p>
            <div>
              <p className="font-medium text-graphite mb-2">Что значит наше название:</p>
              <ul className="space-y-1 list-none pl-0">
                <li><span className="font-medium text-graphite">Долина</span> — символ природной чистоты и гармонии;</li>
                <li><span className="font-medium text-graphite">Сны</span> — метафора безмятежного отдыха;</li>
                <li><span className="font-medium text-graphite">Анэль</span> — лёгкость и изящество.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-graphite mb-2">Наши принципы:</p>
              <ul className="space-y-1 list-none pl-0">
                <li><span className="font-medium text-graphite">Натуральность:</span> используем крапиву, муслин, фланель.</li>
                <li><span className="font-medium text-graphite">Ручная работа:</span> каждое изделие создаётся с вниманием к деталям.</li>
                <li><span className="font-medium text-graphite">Экологичность:</span> отказ от пластика.</li>
                <li><span className="font-medium text-graphite">Эксклюзивность:</span> малые партии, возможность индивидуального заказа.</li>
              </ul>
            </div>
            <p>
              Мы верим: вещи вокруг нас формируют атмосферу жизни. Наши одеяла и текстильные изделия —
              это приглашение замедлиться и ощутить тепло природы.
            </p>
            <p>
              Добро пожаловать в «Долину снов Анэль» — мир, где комфорт встречается с эстетикой.
            </p>
          </div>
        </section>

        {/* Ценности */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif text-graphite text-center">
            Наши ценности
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-3">
              <div className="w-12 h-12 bg-moss/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg">Экологичность</h3>
              <p className="text-sm text-graphite/70">
                Мы используем только натуральные материалы и красители. Наша упаковка — 
                крафт без пластика. Мы заботимся о планете на каждом этапе производства.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <div className="w-12 h-12 bg-moss/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-medium text-lg">Ручная работа</h3>
              <p className="text-sm text-graphite/70">
                Каждое изделие создается вручную опытными мастерами. Мы не используем 
                массовое производство — только малые партии с индивидуальным подходом.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <div className="w-12 h-12 bg-moss/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg">Качество</h3>
              <p className="text-sm text-graphite/70">
                Мы гарантируем высокое качество каждого изделия. Прочные швы, тщательный 
                отбор материалов и контроль на всех этапах — залог долговечности наших товаров.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <div className="w-12 h-12 bg-moss/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg">Традиции</h3>
              <p className="text-sm text-graphite/70">
                Мы возрождаем традиции русского ремесленного искусства, используя проверенные 
                веками техники работы с натуральными тканями.
              </p>
            </div>
          </div>
        </section>

        {/* Материалы */}
        <section className="card p-8 space-y-6">
          <h2 className="text-2xl font-serif text-graphite">Наши материалы</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Лён</h3>
              <p className="text-sm text-graphite/70">
                Натуральное волокно с уникальными терморегулирующими свойствами. 
                Гипоаллергенный, прочный, становится мягче с каждой стиркой.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Крапива</h3>
              <p className="text-sm text-graphite/70">
                Экологически чистый материал с антибактериальными свойствами. 
                Прочнее льна, обладает лечебным эффектом.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Муслин</h3>
              <p className="text-sm text-graphite/70">
                Легкий и дышащий материал ткани, изготовленный из 100% хлопка. 
                Его универсальное применение делает его идеальным выбором как для младенцев, так и для взрослых.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Фланель</h3>
              <p className="text-sm text-graphite/70">
                Ткань входит в состав ворсовых материалов, обладает очень мягким "пушком", 
                который приятен при контакте с кожей даже для новорождённого малыша. Ворс производители 
                располагают как только с изнаночной стороны, так и с обеих одновременно.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Тенсель</h3>
              <p className="text-sm text-graphite/70">
                Волокна тенселя производятся из эвкалиптовых деревьев путем экологически чистого процесса 
                переработки древесины. Это позволяет создать материал, который идеально подходит людям с 
                чувствительной кожей и аллергическими реакциями. Хлопковая добавка дополнительно усиливает 
                эти свойства, обеспечивая комфортный сон даже для обладателей самой нежной кожи.
              </p>
            </div>
          </div>
        </section>

        {/* Бейджи */}
        <div className="text-center space-y-4">
          <h3 className="font-medium text-graphite">Что нас отличает:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge>Ручная работа</Badge>
            <Badge>Натуральные красители</Badge>
            <Badge>Малые партии</Badge>
            <Badge>Без пластика</Badge>
            <Badge>Органические материалы</Badge>
            <Badge>Местное производство</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

