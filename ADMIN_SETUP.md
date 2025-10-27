# Админ панель - Инструкция по установке

## 🎯 Что включено

- ✅ **Управление заказами** - просмотр, изменение статуса
- ✅ **Управление товарами** - добавление, редактирование, удаление
- ✅ **Загрузка изображений** - API для загрузки фото товаров
- ✅ **Авторизация** - простая система входа
- ✅ **Статистика** - количество заказов и товаров

## 📦 Установка

### 1. Применить миграции БД

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 2. Создать первого админа

```bash
# С дефолтными данными (admin / admin123)
npm run admin:create

# Или с кастомными
npm run admin:create myusername mypassword
```

### 3. Пересобрать проект

```bash
npm run build
pm2 restart ecocraft
```

## 🔐 Вход в админку

Перейдите на: **https://snovaniel.ru/admin/login**

Дефолтные данные:
- **Логин**: `admin`
- **Пароль**: `admin123`

⚠️ **ВАЖНО**: Сразу после первого входа смените пароль!

## 📱 Разделы админки

### 1. Главная страница
- `/admin` - статистика и последние заказы

### 2. Заказы
- `/admin/orders` - список всех заказов
- Просмотр деталей заказа
- Изменение статуса (Новый → Подтвержден → В обработке → Отправлен → Доставлен)

### 3. Товары
- `/admin/products` - список товаров
- `/admin/products/new` - добавить товар
- `/admin/products/[id]/edit` - редактировать товар

## 📸 Загрузка изображений

### Вариант 1: Прямая ссылка
Вставьте URL изображения в поле (например `/images/product-1.jpg`)

### Вариант 2: Загрузка файла
1. Используйте компонент `ImageUpload` (будет добавлен в форму)
2. Файл сохранится в `/public/images/products/`
3. URL автоматически вставится в форму

## 🔧 Структура файлов

```
src/app/admin/
├── layout.tsx              # Общий layout с навигацией
├── page.tsx               # Главная страница админки
├── login/
│   ├── page.tsx          # Страница входа
│   ├── LoginForm.tsx     # Форма входа
│   └── actions.ts        # Server Actions для входа
├── orders/
│   ├── page.tsx          # Список заказов
│   ├── OrderStatusBadge.tsx
│   ├── UpdateStatusForm.tsx
│   └── actions.ts
└── products/
    ├── page.tsx          # Список товаров
    ├── ProductForm.tsx   # Универсальная форма товара
    ├── ImageUpload.tsx   # Компонент загрузки изображений
    ├── actions.ts        # CRUD операции
    ├── new/
    │   └── page.tsx     # Добавление товара
    └── [id]/
        └── edit/
            └── page.tsx # Редактирование товара
```

## 🔒 Безопасность

### Текущая версия (для разработки)
- Пароли хранятся в открытом виде
- Простые cookie-сессии

### Для продакшена нужно добавить:
1. **bcrypt** для хеширования паролей:
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

2. Обновить `src/app/admin/login/actions.ts`:
```typescript
import bcrypt from 'bcrypt'

// При создании админа
const hashedPassword = await bcrypt.hash(password, 10)

// При проверке
const isValid = await bcrypt.compare(password, admin.password)
```

3. **JWT токены** вместо простых cookies
4. **Rate limiting** для защиты от брутфорса
5. **HTTPS** (уже настроено)

## 📊 База данных

### Новые таблицы:

**Order** - заказы
- id, orderNumber (уникальный номер)
- name, phone, email, address
- delivery, comment
- total (сумма в копейках)
- status (NEW, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- createdAt, updatedAt

**OrderItem** - позиции заказа
- id, orderId
- product (название товара)
- size (размер)
- qty (количество)
- price (цена в копейках)

**Admin** - администраторы
- id, username, password
- createdAt

## 🚀 Частые команды

```bash
# Создать админа
npm run admin:create admin mypassword123

# Применить миграции
npm run prisma:migrate

# Открыть Prisma Studio (просмотр БД)
npm run prisma:studio

# Пересобрать и перезапустить
npm run build && pm2 restart ecocraft

# Посмотреть логи
pm2 logs ecocraft
```

## 🐛 Отладка

### Проблема: "Не могу войти в админку"
1. Проверьте, что админ создан: `npm run prisma:studio`
2. Проверьте логи: `pm2 logs ecocraft`
3. Пересоздайте админа: `npm run admin:create admin newpass`

### Проблема: "Товары не сохраняются"
1. Проверьте подключение к БД в `.env`
2. Примените миграции: `npm run prisma:migrate`
3. Проверьте логи сервера

### Проблема: "Картинки не загружаются"
1. Проверьте права на `/public/images/products/`
2. Проверьте `next.config.mjs` - должен быть `unoptimized: true`
3. Создайте директорию вручную: `mkdir -p public/images/products`

## 📞 Поддержка

Если возникли проблемы, проверьте:
1. Логи PM2: `pm2 logs ecocraft`
2. Логи Nginx: `tail -f /var/log/nginx/error.log`
3. База данных: `npm run prisma:studio`

