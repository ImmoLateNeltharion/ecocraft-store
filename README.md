# EcoCraft Store — Интернет-магазин одеял и шоперов ручной работы

Сайт для продажи одеял и шоперов ручной работы из экологичных натуральных тканей (лён, крапива, муслин, фланель).

## 🌿 Особенности

- ✅ Каталог с фильтрами по категориям, материалам и теплоте
- ✅ Страницы товаров с описаниями, отзывами и характеристиками
- ✅ Корзина с локальным хранением (cookies)
- ✅ Оформление заказа без платежей (форма заявки)
- ✅ Адаптивный дизайн (мобильные, планшеты, десктоп)
- ✅ SEO-оптимизация
- ✅ Быстрая загрузка (Next.js 14 App Router)

## 🛠 Технологии

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Deployment**: Готов к деплою на Vercel, VPS или любой хостинг с Node.js

## 📋 Требования

- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

## 🚀 Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd ecocraft-store
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

#### Windows:

1. Скачайте и установите PostgreSQL: https://www.postgresql.org/download/windows/
2. Во время установки запомните пароль для пользователя `postgres`
3. Создайте базу данных через pgAdmin или командную строку:

```bash
# Откройте PowerShell и подключитесь к PostgreSQL
psql -U postgres

# В консоли PostgreSQL создайте базу данных
CREATE DATABASE ecocraft;

# Выйдите из консоли
\q
```

#### Linux:

```bash
# Установите PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Создайте базу данных
sudo -u postgres createdb ecocraft
```

### 4. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
# Windows
copy .env.example .env

# Linux
cp .env.example .env
```

Отредактируйте `.env` и укажите данные вашей базы данных:

```env
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/ecocraft?schema=public"
SITE_URL="http://localhost:3000"
```

Замените `ВАШ_ПАРОЛЬ` на пароль от PostgreSQL.

### 5. Применение миграций и заполнение данными

```bash
# Создание таблиц в базе данных
npm run prisma:migrate

# Заполнение тестовыми данными (6 товаров)
npm run prisma:seed
```

### 6. Запуск сервера разработки

```bash
npm run dev
```

Откройте http://localhost:3000 в браузере.

## 📦 Управление товарами

Для добавления, редактирования и удаления товаров используйте Prisma Studio:

```bash
npm run prisma:studio
```

Откроется веб-интерфейс на http://localhost:5555, где вы сможете:
- Добавлять новые товары
- Редактировать существующие
- Управлять размерами, изображениями, отзывами
- Просматривать все данные в удобном виде

## 🖼 Добавление изображений

1. Поместите изображения товаров в папку `public/images/`
2. В Prisma Studio добавьте URL изображения в формате: `/images/название-файла.jpg`
3. Рекомендуемый размер: 1200x900px (соотношение 4:3)

Примеры:
- `/images/blanket-1.jpg`
- `/images/blanket-2.jpg`
- `/images/shopper-1.jpg`

## 🏗 Структура проекта

```
ecocraft-store/
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   └── seed.ts            # Тестовые данные
├── public/
│   └── images/            # Изображения товаров
├── src/
│   ├── app/               # Страницы (Next.js App Router)
│   │   ├── page.tsx       # Главная
│   │   ├── catalog/       # Каталог
│   │   ├── product/       # Страница товара
│   │   ├── cart/          # Корзина
│   │   ├── checkout/      # Оформление заказа
│   │   ├── about/         # О нас
│   │   └── contact/       # Контакты
│   ├── components/        # Компоненты
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── Filters.tsx
│   │   └── Badge.tsx
│   └── lib/               # Утилиты
│       ├── db.ts          # Prisma клиент
│       ├── cart.ts        # Логика корзины
│       └── currency.ts    # Форматирование цен
├── .env                   # Переменные окружения (создать!)
├── package.json
└── README.md
```

## 🚢 Деплой на продакшн

### Vercel (рекомендуется)

1. Зарегистрируйтесь на https://vercel.com
2. Подключите репозиторий
3. Добавьте переменную окружения `DATABASE_URL` в настройках проекта
4. Vercel автоматически соберет и задеплоит сайт

### VPS (Linux сервер)

```bash
# На сервере установите Node.js и PostgreSQL
# Клонируйте репозиторий
git clone <repository-url>
cd ecocraft-store

# Установите зависимости
npm install

# Настройте .env с продакшн базой данных
nano .env

# Примените миграции
npm run prisma:migrate

# Соберите проект
npm run build

# Запустите
npm start
```

Для автоматического перезапуска используйте PM2:

```bash
npm install -g pm2
pm2 start npm --name "ecocraft" -- start
pm2 save
pm2 startup
```

## 🔧 Полезные команды

```bash
# Разработка
npm run dev              # Запуск dev-сервера
npm run build            # Сборка для продакшн
npm start                # Запуск продакшн-сервера

# База данных
npm run prisma:generate  # Генерация Prisma клиента
npm run prisma:migrate   # Применение миграций
npm run prisma:studio    # Открыть Prisma Studio
npm run prisma:seed      # Заполнить тестовыми данными

# Линтинг
npm run lint             # Проверка кода
```

## 📝 Добавление новых товаров

### Через Prisma Studio (рекомендуется):

1. Запустите `npm run prisma:studio`
2. Откройте таблицу `Product`
3. Нажмите "Add record"
4. Заполните поля:
   - `slug`: уникальный URL (например, `linen-blanket-blue`)
   - `title`: название товара
   - `subtitle`: краткое описание
   - `description`: полное описание
   - `category`: `BLANKET` или `SHOPPER`
   - `material`: выберите из списка
   - `price`: цена в копейках (например, 549000 = 5490₽)
   - `ecoTags`: выберите эко-бейджи
5. Добавьте изображения в таблице `Image`
6. Добавьте размеры в таблице `Size`

### Программно:

Отредактируйте `prisma/seed.ts` и запустите `npm run prisma:seed`

## 🎨 Настройка дизайна

Цвета настраиваются в `tailwind.config.ts`:

```typescript
colors: {
  sand: '#E8DAC7',      // Песочный
  milk: '#F7F4EF',      // Молочный
  flax: '#D6C9B8',      // Льняной
  graphite: '#333333',  // Графитовый
  moss: '#6F7D5A',      // Моховый (акцент)
}
```

## 🐛 Решение проблем

### Ошибка подключения к базе данных

```
Error: P1001: Can't reach database server
```

**Решение**:
1. Убедитесь, что PostgreSQL запущен
2. Проверьте правильность `DATABASE_URL` в `.env`
3. Проверьте, что база данных создана

### Ошибка при миграции

```
Error: P3009: migrate found failed migrations
```

**Решение**:
```bash
# Сбросьте базу данных (ВНИМАНИЕ: удалит все данные!)
npx prisma migrate reset

# Или создайте новую миграцию
npx prisma migrate dev --name init
```

### Порт 3000 занят

**Решение**:
```bash
# Запустите на другом порту
PORT=3001 npm run dev
```

## 📞 Поддержка

Если возникли вопросы:
1. Проверьте этот README
2. Посмотрите логи в консоли
3. Проверьте переменные окружения в `.env`

## 📄 Лицензия

MIT

---

Сделано с ❤️ для EcoCraft

