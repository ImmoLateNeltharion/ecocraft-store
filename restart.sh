#!/bin/bash

# Скрипт для автоматического перезапуска сайта EcoCraft
# Использование: ./restart.sh

echo "🔄 Начинаю перезапуск сайта EcoCraft..."

# Переходим в папку проекта
cd /home/ecocraft-store

# Проверяем статус PM2
echo "📊 Текущий статус PM2:"
pm2 status

# Получаем изменения из Git
echo "📥 Получение изменений из Git..."
git pull

# Проверяем, изменился ли package.json
if git diff HEAD~1 package.json > /dev/null 2>&1; then
    echo "📦 Обновление зависимостей..."
    npm install
fi

# Применяем миграции (если есть изменения в схеме БД)
echo "🗄️ Проверка миграций..."
npm run prisma:migrate

# Пересобираем проект
echo "🔨 Сборка проекта..."
npm run build

# Перезапускаем PM2
echo "🚀 Перезапуск приложения..."
pm2 restart ecocraft

# Ждем 3 секунды для стабилизации
sleep 3

# Проверяем статус
echo "✅ Проверка статуса:"
pm2 status

# Проверяем логи на ошибки
echo "📋 Последние логи:"
pm2 logs ecocraft --lines 10

# Проверяем доступность сайта
echo "🌐 Проверка доступности сайта..."
if curl -s -o /dev/null -w "%{http_code}" https://snovaniel.ru | grep -q "200"; then
    echo "✅ Сайт работает корректно!"
else
    echo "❌ Проблема с доступностью сайта!"
fi

echo "🎉 Перезапуск завершен!"
