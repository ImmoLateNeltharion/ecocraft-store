import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.argv[2]
  const password = process.argv[3]

  if (!username || !password) {
    console.error('Использование: npm run admin:create -- <логин> <пароль>')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('❌ Пароль должен быть не короче 8 символов')
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { password: hash },
    create: { username, password: hash }
  })

  // При смене пароля сбрасываем все активные сессии
  await prisma.adminSession.deleteMany({ where: { adminId: admin.id } })

  console.log('✅ Админ создан/обновлён:', admin.username)
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
