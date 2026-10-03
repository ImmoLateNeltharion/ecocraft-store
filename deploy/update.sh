#!/usr/bin/env bash
# Обновление сайта из git: pull -> пересборка -> миграции (в entrypoint) -> перезапуск без простоя базы
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only origin main
docker compose up -d --build app
docker compose exec nginx nginx -s reload || true
docker image prune -f >/dev/null

echo "✅ Обновлено. Логи: docker compose logs -f app"
