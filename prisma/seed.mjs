// Базовый каталог магазина. Идемпотентен: повторный запуск не дублирует данные.
//   локально:  npm run prisma:seed
//   в Docker:  docker compose exec app node prisma/seed.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { id: 'CHILDREN', name: 'Детские одеяла', order: 1 },
  { id: 'STANDARD', name: 'Одеяла стандарт', order: 2 },
  { id: 'CARPET_PLANE', name: 'Одеяло «Ковёр-самолёт»', order: 3 },
  { id: 'BLANKET', name: 'Пледы', order: 4 },
  { id: 'SHOPPER', name: 'Шоперы + мешочки', order: 5 }
]

const DESCRIPTION =
  'Одеяло ручной работы из натуральных тканей. Лицевая сторона — муслин или фланель с авторским принтом, ' +
  'изнанка — плотная крапива. Натуральные волокна гипоаллергенны, хорошо дышат и держат тепло. ' +
  'Каждое одеяло шьётся вручную в нашей мастерской, упаковка — крафт без пластика.'

// Цены в копейках
const PRODUCTS = [
  {
    slug: 'simfoniya',
    title: 'Одеяло «Симфония»',
    subtitle: 'Крапива и муслин, акварельные пионы',
    materials: ['NETTLE', 'MUSLIN'],
    color: 'Ягодный / цветочный принт',
    pattern: 'FLORAL',
    image: '/images/products/simfoniya.jpg',
    sizes: [{ label: '200×130 см', inStock: 1 }]
  },
  {
    slug: 'lazurnyj-buket',
    title: 'Одеяло «Лазурный букет»',
    subtitle: 'Крапива и фланель, синие веточки',
    materials: ['NETTLE', 'FLANNEL'],
    color: 'Синий / бежевый с синим принтом',
    pattern: 'FLORAL',
    image: '/images/products/lazurnyj-buket.jpg',
    sizes: [{ label: '200×130 см', inStock: 1 }]
  },
  {
    slug: 'gerbarij',
    title: 'Одеяло «Гербарий»',
    subtitle: 'Крапива и муслин, мелкие цветы на горчичном',
    materials: ['NETTLE', 'MUSLIN'],
    color: 'Пыльная роза / горчичный с принтом',
    pattern: 'FLORAL',
    image: '/images/products/gerbarij.jpg',
    sizes: [{ label: '220×140 см', inStock: 1 }]
  },
  {
    slug: 'dorogu-zamelo',
    title: 'Одеяло «Дорогу замело»',
    subtitle: 'Крапива и муслин, зимний лес с лисой',
    materials: ['NETTLE', 'MUSLIN'],
    color: 'Хвойный зелёный / белый с принтом',
    pattern: 'FLORAL',
    image: '/images/products/dorogu-zamelo.png',
    sizes: [{ label: '200×130 см', inStock: 1 }]
  },
  {
    slug: 'saharnaya-vata',
    title: 'Одеяло «Сахарная вата»',
    subtitle: 'Крапива и муслин, золотые капли',
    materials: ['NETTLE', 'MUSLIN'],
    color: 'Пудровый розовый / молочный с золотом',
    pattern: 'SOLID',
    image: '/images/products/saharnaya-vata.webp',
    sizes: [{ label: '200×130 см', inStock: 1 }]
  },
  {
    // Название временное — в Telegram подпись к этому фото не сохранилась. Переименуйте в админке.
    slug: 'rozovyj-sad',
    title: 'Одеяло «Розовый сад»',
    subtitle: 'Крапива и муслин, розы и листья',
    materials: ['NETTLE', 'MUSLIN'],
    color: 'Коралловый / белый с розами',
    pattern: 'FLORAL',
    image: '/images/products/rozovyj-sad.jpg',
    sizes: [{ label: '200×130 см', inStock: 1 }]
  }
]

async function main() {
  console.log('🌱 Заполняю базу...')

  for (const c of CATEGORIES) {
    await prisma.productCategory.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, slug: c.id }
    })
  }

  for (const p of PRODUCTS) {
    const { image, sizes, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        description: DESCRIPTION,
        category: 'STANDARD',
        warmth: 'WARM',
        price: 1350000, // 13 500 ₽
        ecoTags: ['HANDMADE', 'SMALL_BATCH', 'ZERO_PLASTIC_PACKAGING', 'LOCAL_PRODUCTION'],
        images: { create: [{ url: image, alt: p.title }] },
        sizes: { create: sizes }
      }
    })
    console.log('  ✓', p.title)
  }

  console.log('✅ Готово')
}

main()
  .catch((e) => { console.error('❌ Ошибка:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
