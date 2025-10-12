# 🚀 Быстрый старт

## Минимальные шаги для запуска сайта

### 1. Установите зависимости
```bash
npm install
```

### 2. Установите и настройте PostgreSQL

**Windows:**
- Скачайте: https://www.postgresql.org/download/windows/
- Установите (запомните пароль!)
- Создайте базу данных через pgAdmin или:
  ```bash
  psql -U postgres
  CREATE DATABASE ecocraft;
  \q
  ```

**Linux:**
```bash
sudo apt install postgresql
sudo -u postgres createdb ecocraft
```

### 3. Создайте файл .env

```bash
# Windows
copy .env.example .env

# Linux
cp .env.example .env
```

Отредактируйте `.env`:
```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/ecocraft?schema=public"
SITE_URL="http://localhost:3000"
```

### 4. Примените миграции и добавьте тестовые данные

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Запустите сайт

```bash
npm run dev
```

Откройте http://localhost:3000 🎉

---

## 📦 Управление товарами

```bash
npm run prisma:studio
```

Откроется http://localhost:5555 — добавляйте/редактируйте товары через веб-интерфейс.

---

## 🖼 Добавление изображений

1. Поместите фото в `public/images/`
2. В Prisma Studio добавьте URL: `/images/название.jpg`

Подробнее: см. `IMAGES_GUIDE.md`

---

## ❓ Проблемы?

### Ошибка подключения к БД
- Проверьте, что PostgreSQL запущен
- Проверьте пароль в `.env`

### Порт 3000 занят
```bash
PORT=3001 npm run dev
```

### Нужно пересоздать БД
```bash
npx prisma migrate reset
npm run prisma:seed
```

---

## 📚 Полная документация

См. `README.md` для детальных инструкций по деплою, настройке и расширению функционала.

