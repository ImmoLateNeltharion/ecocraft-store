import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import Badge from '@/components/Badge'

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  })

  return (
    <div className="space-y-0">
      {/* Hero с большим изображением и текстом поверх */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&h=1080&fit=crop"
          alt="Уютные одеяла"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 leading-tight drop-shadow-lg">
            Warm & Made Blankets
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Натуральные ткани, созданные с любовью. Экологичные одеяла и шоперы ручной работы 
            для тех, кто ценит уют и заботу о природе.
          </p>
          <Link 
            href="/catalog" 
            className="inline-block bg-white text-graphite px-8 py-4 rounded-full font-medium hover:bg-sand transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Смотреть коллекцию
          </Link>
        </div>
      </section>

      {/* Сетка изображений с текстом (как на референсе) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {/* Карточка 1 */}
        <div className="relative h-[400px] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=800&fit=crop"
            alt="Льняные одеяла"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 group-hover:translate-y-0 translate-y-2">
            <h3 className="text-2xl font-serif mb-2">Льняная коллекция</h3>
            <p className="text-sm text-white/80 mb-4">Натуральный лён с терморегуляцией</p>
            <Link href="/catalog?material=LINEN" className="text-sm underline hover:no-underline">
              Смотреть →
            </Link>
          </div>
        </div>

        {/* Карточка 2 */}
        <div className="relative h-[400px] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=800&fit=crop"
            alt="Одеяла из муслина + крапива"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 group-hover:translate-y-0 translate-y-2">
            <h3 className="text-2xl font-serif mb-2">Одеяла из муслина + крапива</h3>
            <p className="text-sm text-white/80 mb-4">Легкий и дышащий материал ткани, изготовленный из 100% хлопка. Его универсальное применение делает его идеальным выбором как для младенцев, так и для взрослых.</p>
            <Link href="/catalog?material=MUSLIN" className="text-sm underline hover:no-underline">
              Смотреть →
            </Link>
          </div>
        </div>

        {/* Карточка 3 */}
        <div className="relative h-[400px] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800&h=800&fit=crop"
            alt="Одеяла из фланели + крапива"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 group-hover:translate-y-0 translate-y-2">
            <h3 className="text-2xl font-serif mb-2">Одеяла из фланели + крапива</h3>
            <p className="text-sm text-white/80 mb-4">Ткань входит в состав ворсовых материалов, обладает очень мягким "пушком", который приятен при контакте с кожей даже для новорождённого малыша. Ворс производители располагают как только с изнаночной стороны, так и с обеих одновременно.</p>
            <Link href="/catalog?material=FLANNEL" className="text-sm underline hover:no-underline">
              Смотреть →
            </Link>
          </div>
        </div>

        {/* Карточка 4 */}
        <div className="relative h-[400px] overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=800&fit=crop"
            alt="Одеяла из тенселя + крапива"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500 group-hover:translate-y-0 translate-y-2">
            <h3 className="text-2xl font-serif mb-2">Одеяла из тенселя + крапива</h3>
            <p className="text-sm text-white/80 mb-4">Волокна тенселя производятся из эвкалиптовых деревьев путем экологически чистого процесса переработки древесины. Это позволяет создать материал, который идеально подходит людям с чувствительной кожей и аллергическими реакциями. Хлопковая добавка дополнительно усиливает эти свойства, обеспечивая комфортный сон даже для обладателей самой нежной кожи.</p>
            <Link href="/catalog?material=TENCEL" className="text-sm underline hover:no-underline">
              Смотреть →
            </Link>
          </div>
        </div>
      </section>

      {/* Секция с текстом и изображением (текст обтекает изображение) */}
      <section className="container py-16">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Изображение справа, текст обтекает слева */}
            <div className="float-right ml-8 mb-8 w-full md:w-1/2 lg:w-2/5">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl animate-slide-in-right">
                <Image
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=1000&fit=crop"
                  alt="Warm & Quality"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif mb-6 text-graphite animate-slide-in-left">
              Warm st Quality
            </h2>
            
            <div className="text-graphite/80 leading-relaxed space-y-4 animate-fade-in-up">
              <p className="text-lg">
                Наш магазин представляет уникальную коллекцию высококачественных одеял ручной работы, 
                выполненных исключительно из экологически чистых тканей.
              </p>
              
              <p>
                Мы предлагаем изделия из натурального волокна крапивы, муслина и мягкой натуральной фланели. 
                Все одеяла изготовлены вручную мастерами своего дела с соблюдением традиций русского 
                ремесленного искусства.
              </p>
              
              <p>
                Каждое изделие отличается индивидуальностью исполнения, прочностью ткани и превосходными 
                теплоизоляционными свойствами. Используемые натуральные волокна гипоаллергенны и обеспечивают 
                оптимальный микроклимат во время сна.
              </p>
              
              <p>
                Ручная работа гарантирует прочность и долговечность каждого продукта. Мягкость ткани создает 
                ощущение комфорта и способствует полноценному отдыху.
              </p>
              
              <div className="pt-6">
                <Link 
                  href="/about" 
                  className="inline-flex items-center gap-2 bg-moss text-white px-6 py-3 rounded-full hover:bg-moss/90 transition-all duration-300 hover:gap-3"
                >
                  Узнать больше
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Новинки */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-graphite mb-4">
            Наша коллекция
          </h2>
          <p className="text-graphite/70 max-w-2xl mx-auto">
            Каждое изделие создано с любовью к природе и традициям ручного мастерства
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((p, index) => (
            <div 
              key={p.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard
                slug={p.slug}
                title={p.title}
                subtitle={p.subtitle}
                price={p.price}
                image={p.images[0]?.url ?? '/images/placeholder.jpg'}
                material={p.material}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-2 text-moss hover:text-moss/80 transition-all font-medium text-lg group"
          >
            Смотреть весь каталог
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* CTA с фоновым изображением */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1920&h=800&fit=crop"
          alt="Индивидуальный заказ"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Индивидуальный заказ
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Хотите одеяло или шопер с уникальным дизайном? Мы создадим изделие специально для вас 
            с учетом всех ваших пожеланий по размеру, цвету и материалу.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-white text-graphite px-8 py-4 rounded-full font-medium hover:bg-sand transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Оставить заявку
          </Link>
        </div>
      </section>
    </div>
  )
}

