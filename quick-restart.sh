#!/bin/bash

# Быстрый перезапуск без обновления кода
# Использование: ./quick-restart.sh

echo "⚡ Быстрый перезапуск..."

cd /home/ecocraft-store

# Пересборка и перезапуск
npm run build
pm2 restart ecocraft

# Проверка статуса
pm2 status

echo "✅ Готово!"
