#!/bin/sh
set -e

# Фото товаров из репо -> volume (только новые, загруженные через админку не трогаем)
if [ -d /app/seed-images ]; then
  cp -n /app/seed-images/* /app/public/images/products/ 2>/dev/null || true
fi

echo "⏳ Применяю миграции базы данных..."
node node_modules/prisma/build/index.js migrate deploy

echo "🚀 Запускаю приложение"
exec "$@"
