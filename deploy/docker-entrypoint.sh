#!/bin/sh
set -e

echo "⏳ Применяю миграции базы данных..."
node node_modules/prisma/build/index.js migrate deploy

echo "🚀 Запускаю приложение"
exec "$@"
