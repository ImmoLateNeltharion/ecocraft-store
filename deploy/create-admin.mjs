// Создание/обновление админа внутри контейнера:
//   docker compose exec app node scripts/create-admin.mjs <логин> <пароль>
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const [username, password] = process.argv.slice(2)
if (!username || !password) {
  console.error('Использование: node scripts/create-admin.mjs <логин> <пароль>')
  process.exit(1)
}
if (password.length < 8) {
  console.error('❌ Пароль должен быть не короче 8 символов')
  process.exit(1)
}

const prisma = new PrismaClient()
const hash = await bcrypt.hash(password, 12)
const admin = await prisma.admin.upsert({
  where: { username },
  update: { password: hash },
  create: { username, password: hash }
})
await prisma.adminSession.deleteMany({ where: { adminId: admin.id } })
console.log('✅ Админ создан/обновлён:', admin.username)
await prisma.$disconnect()
