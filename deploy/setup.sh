#!/usr/bin/env bash
# Первичная установка магазина на чистую VPS (Debian/Ubuntu).
# Запуск от root или через sudo:
#   bash deploy/setup.sh
# Повторный запуск безопасен: скрипт идемпотентный.

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

# ---------- 1. Docker ----------
if ! command -v docker >/dev/null 2>&1; then
  echo "📦 Устанавливаю Docker..."
  curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "❌ Нужен Docker Compose v2 (docker compose). Установите docker-compose-plugin." >&2
  exit 1
fi

# ---------- 2. .env ----------
if [ ! -f .env ]; then
  cp .env.example .env
  # Генерируем пароль базы
  PW="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)"
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=\"$PW\"|" .env
  echo "📝 Создан .env — ОТКРОЙТЕ ЕГО И ЗАПОЛНИТЕ: NEXT_PUBLIC_SITE_URL, YOOKASSA_*, TELEGRAM_*, LEGAL_*"
  echo "   nano $ROOT/.env"
  echo "   Затем запустите скрипт ещё раз."
  exit 0
fi

set -a; . ./.env; set +a
: "${NEXT_PUBLIC_SITE_URL:?NEXT_PUBLIC_SITE_URL не задан в .env}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD не задан в .env}"
DOMAIN="$(echo "$NEXT_PUBLIC_SITE_URL" | sed -E 's|https?://||; s|/.*||')"
echo "🌐 Домен: $DOMAIN"

# ---------- 3. nginx: сначала только HTTP, чтобы получить сертификат ----------
mkdir -p deploy/nginx/conf.d deploy/certbot/conf deploy/certbot/www
if [ ! -f "deploy/certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "🔓 Сертификата ещё нет — поднимаю nginx в HTTP-режиме"
  sed "s|\${DOMAIN}|$DOMAIN|g" deploy/nginx/http-only.conf.template > deploy/nginx/conf.d/site.conf
else
  sed "s|\${DOMAIN}|$DOMAIN|g" deploy/nginx/site.conf.template > deploy/nginx/conf.d/site.conf
fi

# ---------- 4. Сборка и запуск ----------
echo "🔨 Собираю и запускаю контейнеры..."
docker compose up -d --build db app nginx

echo "⏳ Жду, пока приложение станет здоровым..."
for i in $(seq 1 60); do
  if docker compose ps app --format '{{.Health}}' 2>/dev/null | grep -q healthy; then break; fi
  sleep 3
done
docker compose ps

# ---------- 5. Сертификат Let's Encrypt ----------
if [ ! -f "deploy/certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "🔐 Запрашиваю сертификат для $DOMAIN и www.$DOMAIN..."
  echo "   (DNS A-записи домена и www должны уже указывать на этот сервер)"
  docker compose run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
    -d "$DOMAIN" -d "www.$DOMAIN" --email "admin@$DOMAIN" --agree-tos --no-eff-email \
    || { echo "❌ Не удалось получить сертификат. Проверьте DNS и повторите: bash deploy/setup.sh"; exit 1; }

  echo "🔒 Переключаю nginx на HTTPS"
  sed "s|\${DOMAIN}|$DOMAIN|g" deploy/nginx/site.conf.template > deploy/nginx/conf.d/site.conf
  docker compose up -d certbot
  docker compose exec nginx nginx -s reload
fi

# ---------- 6. Админ ----------
if ! docker compose exec -T db psql -U "${POSTGRES_USER:-ecocraft}" -d "${POSTGRES_DB:-ecocraft}" -tAc 'select count(*) from "Admin"' 2>/dev/null | grep -qE '^[1-9]'; then
  echo
  echo "👤 Админов ещё нет. Создайте первого:"
  echo "   docker compose exec app node scripts/create-admin.mjs <логин> <пароль>"
fi

echo
echo "✅ Готово: $NEXT_PUBLIC_SITE_URL"
echo "   Логи:        docker compose logs -f app"
echo "   Обновление:  bash deploy/update.sh"
