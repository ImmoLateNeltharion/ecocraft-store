import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаю заполнение базы данных...')

  // Категории каталога (на них ссылается главная страница)
  const categories = [
    { id: 'CHILDREN', name: 'Детские одеяла', order: 1 },
    { id: 'STANDARD', name: 'Одеяла стандарт', order: 2 },
    { id: 'CARPET_PLANE', name: 'Одеяло «Ковёр-самолёт»', order: 3 },
    { id: 'BLANKET', name: 'Пледы', order: 4 },
    { id: 'SHOPPER', name: 'Шоперы + мешочки', order: 5 }
  ]
  for (const c of categories) {
    await prisma.productCategory.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, slug: c.id }
    })
  }

  // Одеяло 1: Льняное классическое
  await prisma.product.upsert({
    where: { slug: 'linen-throw-classic' },
    update: {},
    create: {
      slug: 'linen-throw-classic',
      title: 'Плед льняной "Классика"',
      subtitle: '100% натуральный лён',
      description: 'Сшито вручную в нашей мастерской из экологически чистого льна. Натуральные красители, упаковка — крафт без пластика. Лён обладает уникальными терморегулирующими свойствами: согревает зимой и охлаждает летом. Идеально подходит для людей с чувствительной кожей.',
      category: 'BLANKET',
      materials: ['LINEN'],
      warmth: 'MEDIUM',
      color: 'Натуральный лён',
      pattern: 'SOLID',
      price: 549000, // 5 490 ₽
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=900&fit=crop', alt: 'Плед льняной Классика' }
        ]
      },
      ecoTags: ['HANDMADE', 'NATURAL_DYES', 'SMALL_BATCH', 'ZERO_PLASTIC_PACKAGING'],
      sizes: {
        create: [
          { label: '130x170 см (плед)', inStock: 8 },
          { label: '180x220 см (двуспальное)', inStock: 4 }
        ]
      },
      reviews: {
        create: [
          { author: 'Мария', body: 'Очень приятный на ощупь, уютный! Качество отличное.', stars: 5 },
          { author: 'Иван', body: 'Качественный шов, аккуратная работа. Рекомендую!', stars: 5 }
        ]
      },
      rating: 5.0
    }
  })

  // Одеяло 2: Из крапивы
  await prisma.product.upsert({
    where: { slug: 'nettle-blanket-eco' },
    update: {},
    create: {
      slug: 'nettle-blanket-eco',
      title: 'Одеяло из крапивы "Эко"',
      subtitle: 'Волокно крапивы, ручная работа',
      description: 'Уникальное одеяло из натурального волокна крапивы — экологически чистого материала с превосходными теплоизоляционными свойствами. Крапива гипоаллергенна, обладает антибактериальными свойствами и создает оптимальный микроклимат во время сна. Каждое изделие отличается индивидуальностью исполнения.',
      category: 'BLANKET',
      materials: ['NETTLE', 'MUSLIN'],
      warmth: 'WARM',
      color: 'Натуральный зеленый',
      pattern: 'SOLID',
      price: 789000, // 7 890 ₽
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=900&fit=crop', alt: 'Одеяло из крапивы Эко' }
        ]
      },
      ecoTags: ['HANDMADE', 'ORGANIC', 'SMALL_BATCH', 'LOCAL_PRODUCTION'],
      sizes: {
        create: [
          { label: '140x200 см (полуторное)', inStock: 5 },
          { label: '180x220 см (двуспальное)', inStock: 3 }
        ]
      },
      reviews: {
        create: [
          { author: 'Елена', body: 'Невероятно теплое и легкое одновременно! Очень довольна покупкой.', stars: 5 }
        ]
      },
      rating: 5.0
    }
  })

  // Одеяло 3: Муслиновое
  await prisma.product.upsert({
    where: { slug: 'muslin-blanket-soft' },
    update: {},
    create: {
      slug: 'muslin-blanket-soft',
      title: 'Плед муслиновый "Нежность"',
      subtitle: 'Мягкий муслин, 4 слоя',
      description: 'Воздушный плед из натурального муслина в 4 слоя. Муслин — это тонкая хлопковая ткань полотняного переплетения, которая становится мягче с каждой стиркой. Идеален для межсезонья и как легкое покрывало летом. Подходит для детей и взрослых.',
      category: 'BLANKET',
      materials: ['MUSLIN', 'COTTON'],
      warmth: 'LIGHT',
      color: 'Бежевый',
      pattern: 'SOLID',
      price: 429000, // 4 290 ₽
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&h=900&fit=crop', alt: 'Плед муслиновый Нежность' }
        ]
      },
      ecoTags: ['HANDMADE', 'ORGANIC', 'ZERO_PLASTIC_PACKAGING'],
      sizes: {
        create: [
          { label: '120x150 см (детский)', inStock: 10 },
          { label: '150x200 см (взрослый)', inStock: 6 }
        ]
      },
      reviews: {
        create: [
          { author: 'Анна', body: 'Купила для ребенка, очень мягкий и приятный. Отлично дышит!', stars: 5 }
        ]
      },
      rating: 5.0
    }
  })

  // Одеяло 4: Фланелевое
  await prisma.product.upsert({
    where: { slug: 'flannel-blanket-warm' },
    update: {},
    create: {
      slug: 'flannel-blanket-warm',
      title: 'Одеяло фланелевое "Уют"',
      subtitle: 'Натуральная мягкая фланель',
      description: 'Теплое одеяло из натуральной фланели — мягкой хлопковой ткани с начесом. Фланель отлично сохраняет тепло, приятна к телу и не вызывает аллергии. Традиционный русский материал, проверенный временем. Идеально для холодных зимних вечеров.',
      category: 'BLANKET',
      materials: ['FLANNEL', 'NETTLE'],
      warmth: 'WARM',
      color: 'Терракотовый',
      pattern: 'CHECKERED',
      price: 649000, // 6 490 ₽
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1200&h=900&fit=crop', alt: 'Одеяло фланелевое Уют' }
        ]
      },
      ecoTags: ['HANDMADE', 'NATURAL_DYES', 'LOCAL_PRODUCTION'],
      sizes: {
        create: [
          { label: '140x200 см (полуторное)', inStock: 7 },
          { label: '200x220 см (евро)', inStock: 4 }
        ]
      },
      reviews: {
        create: [
          { author: 'Дмитрий', body: 'Очень теплое и качественное. Цвет красивый, натуральный.', stars: 5 }
        ]
      },
      rating: 5.0
    }
  })

  // Шопер 1: Льняной
  await prisma.product.upsert({
    where: { slug: 'linen-shopper-eco' },
    update: {},
    create: {
      slug: 'linen-shopper-eco',
      title: 'Шопер льняной "Эко-стиль"',
      subtitle: 'Прочный лён, ручные ручки',
      description: 'Вместительная сумка-шопер из прочного льна. Идеальная альтернатива пластиковым пакетам. Выдерживает до 10 кг, имеет удобные длинные ручки. Можно стирать в машинке. Минималистичный дизайн подойдет к любому стилю.',
      category: 'SHOPPER',
      materials: ['LINEN', 'RECYCLED'],
      color: 'Натуральный',
      pattern: 'SOLID',
      price: 189000, // 1 890 ₽
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&h=900&fit=crop', alt: 'Шопер льняной Эко-стиль' }
        ]
      },
      ecoTags: ['HANDMADE', 'ZERO_PLASTIC_PACKAGING', 'RECYCLED_MATERIALS'],
      sizes: {
        create: [
          { label: '40x45 см (стандарт)', inStock: 15 }
        ]
      },
      reviews: {
        create: [
          { author: 'Ольга', body: 'Отличный шопер! Прочный, вместительный. Пользуюсь каждый день.', stars: 5 }
        ]
      },
      rating: 5.0
    }
  })

  // Шопер 2: Хлопковый с принтом
  await prisma.product.upsert({
    where: { slug: 'cotton-shopper-print' },
    update: {},
    create: {
      slug: 'cotton-shopper-print',
      title: 'Шопер хлопковый "Винтаж"',
      subtitle: 'Органический хлопок, авторский принт',
      description: 'Стильный шопер из органического хлопка с авторским принтом в винтажном стиле. Печать выполнена экологичными красками на водной основе. Компактно складывается, легко стирается. Отличный подарок для тех, кто ценит уникальность и заботу об экологии.',
      category: 'SHOPPER',
      materials: ['COTTON', 'LINEN'],
      color: 'Бежевый с принтом',
      pattern: 'FLORAL',
      price: 229000, // 2 290 ₽
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1200&h=900&fit=crop', alt: 'Шопер хлопковый Винтаж' }
        ]
      },
      ecoTags: ['HANDMADE', 'ORGANIC', 'NATURAL_DYES', 'SMALL_BATCH'],
      sizes: {
        create: [
          { label: '38x42 см (стандарт)', inStock: 12 }
        ]
      },
      reviews: {
        create: [
          { author: 'Светлана', body: 'Красивый принт, качественная ткань. Получаю комплименты!', stars: 5 }
        ]
      },
      rating: 5.0
    }
  })

  console.log('✅ База данных успешно заполнена!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

