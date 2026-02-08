#!/bin/bash

# Скрипт для настройки .env и обновления проекта на сервере

cd /home/ecocraft-store

echo "📝 Создаю/обновляю .env файл..."

# Проверяем, существует ли .env и сохраняем DATABASE_URL
DATABASE_URL_VALUE="postgresql://postgres:password@localhost:5432/ecocraft?schema=public"
if [ -f .env ]; then
    echo "⚠️  Файл .env уже существует. Создаю резервную копию..."
    cp .env .env.backup
    
    # Пытаемся извлечь существующий DATABASE_URL
    EXISTING_DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"')
    if [ ! -z "$EXISTING_DB_URL" ]; then
        DATABASE_URL_VALUE="$EXISTING_DB_URL"
        echo "✅ Сохраняю существующий DATABASE_URL"
    fi
fi

# Создаем .env файл
cat > .env << EOF
# База данных PostgreSQL
DATABASE_URL="$DATABASE_URL_VALUE"

# URL сайта для Next.js
NEXT_PUBLIC_SITE_URL="https://snovaniel.ru"

# ЮKassa - ID магазина
YOOKASSA_SHOP_ID="1198351"

# ЮKassa - Секретный ключ
# ⚠️ ВАЖНО: Получите ключ в личном кабинете ЮКассы и добавьте вручную!
YOOKASSA_SECRET_KEY="ваш_secret_key"

# Режим работы
NODE_ENV="production"
EOF

echo "✅ .env файл создан/обновлен"

echo ""
echo "📥 Обновляю проект из Git..."
git pull origin main

echo ""
echo "📦 Устанавливаю зависимости (если нужно)..."
npm install

echo ""
echo "🔨 Пересобираю проект..."
npm run build

echo ""
echo "🚀 Перезапускаю приложение..."
pm2 restart ecocraft

echo ""
echo "✅ Готово! Проверяю статус..."
pm2 status

echo ""
echo "📋 Логи (последние 20 строк):"
pm2 logs ecocraft --lines 20 --nostream

