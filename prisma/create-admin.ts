import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const username = process.argv[2] || 'admin'
  const password = process.argv[3] || 'admin123'

  console.log('🔑 Создание админа...')
  console.log(`Username: ${username}`)
  console.log(`Password: ${password}`)

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { password },
    create: {
      username,
      password // В продакшене используйте bcrypt!
    }
  })

  console.log('✅ Админ создан:', admin.username)
  console.log('\n⚠️  ВАЖНО: В продакшене используйте хеширование паролей (bcrypt)!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

