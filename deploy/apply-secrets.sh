#!/usr/bin/env bash
# Применяет секреты из локального файла к серверу одной командой.
#   bash deploy/apply-secrets.sh ~/ecocraft-secrets.env
#
# Формат файла (все строки необязательны, пустые пропускаются):
#   ADMIN_LOGIN=admin
#   ADMIN_PASSWORD=...          # от 8 символов
#   ROOT_PASSWORD=...           # новый пароль root на сервере
#   TELEGRAM_BOT_TOKEN=...
#   TELEGRAM_CHAT_ID=...        # если пусто — определится сам (сначала напишите боту /start)
#   YOOKASSA_SHOP_ID=...
#   YOOKASSA_SECRET_KEY=...
#   LEGAL_ENTITY=...  LEGAL_INN=...  LEGAL_OGRNIP=...  LEGAL_ADDRESS=...
#
# Файл после применения удаляется и локально, и на сервере.

set -euo pipefail

SECRETS="${1:?Укажите файл с секретами: bash deploy/apply-secrets.sh ~/ecocraft-secrets.env}"
HOST="${ECOCRAFT_HOST:-root@212.193.15.68}"
KEY="${ECOCRAFT_KEY:-$HOME/.ssh/id_ed25519_ecocraft_vps}"
REMOTE_DIR=/opt/ecocraft-store

[ -f "$SECRETS" ] || { echo "❌ Файл не найден: $SECRETS"; exit 1; }
SSH=(ssh -i "$KEY" -o BatchMode=yes "$HOST")

echo "📤 Копирую файл на сервер..."
scp -q -i "$KEY" "$SECRETS" "$HOST:/root/.ecocraft-secrets"

echo "⚙️  Применяю на сервере..."
"${SSH[@]}" bash -s <<'REMOTE'
set -euo pipefail
cd /opt/ecocraft-store
F=/root/.ecocraft-secrets
chmod 600 "$F"

# Читаем файл в переменные (кавычки в значениях снимаем)
get() { grep -E "^$1=" "$F" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"; }

# 1. .env: ключи, которые есть в файле и не пусты
for k in TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID YOOKASSA_SHOP_ID YOOKASSA_SECRET_KEY LEGAL_ENTITY LEGAL_INN LEGAL_OGRNIP LEGAL_ADDRESS; do
  v="$(get "$k")"
  [ -n "$v" ] || continue
  esc="$(printf '%s' "$v" | sed -e 's/[\/&|]/\\&/g')"
  if grep -q "^$k=" .env; then sed -i "s|^$k=.*|$k=\"$esc\"|" .env; else echo "$k=\"$v\"" >> .env; fi
  echo "  ✓ $k записан в .env"
done

# 2. Telegram chat_id, если токен есть, а chat_id нет
TOKEN="$(grep -E '^TELEGRAM_BOT_TOKEN=' .env | cut -d= -f2- | tr -d '"')"
CHAT="$(grep -E '^TELEGRAM_CHAT_ID=' .env | cut -d= -f2- | tr -d '"')"
if [ -n "$TOKEN" ] && [ -z "$CHAT" ]; then
  CHAT="$(curl -s "https://api.telegram.org/bot$TOKEN/getUpdates" | grep -o '"chat":{"id":-\?[0-9]*' | head -1 | grep -o -- '-\?[0-9]*$' || true)"
  if [ -n "$CHAT" ]; then
    sed -i "s|^TELEGRAM_CHAT_ID=.*|TELEGRAM_CHAT_ID=\"$CHAT\"|" .env
    echo "  ✓ TELEGRAM_CHAT_ID определён автоматически: $CHAT"
  else
    echo "  ⚠️  Не удалось определить chat_id: напишите боту /start и запустите скрипт ещё раз"
  fi
fi

# 3. Перезапуск приложения с новым .env
docker compose up -d app >/dev/null 2>&1
echo "  ✓ приложение перезапущено"

# 4. Админ сайта
AL="$(get ADMIN_LOGIN)"; AP="$(get ADMIN_PASSWORD)"
if [ -n "$AL" ] && [ -n "$AP" ]; then
  for i in $(seq 20); do [ "$(docker compose ps app --format '{{.Health}}')" = healthy ] && break; sleep 3; done
  docker compose exec -T app node scripts/create-admin.mjs "$AL" "$AP"
fi

# 5. Пароль root
RP="$(get ROOT_PASSWORD)"
if [ -n "$RP" ]; then echo "root:$RP" | chpasswd && echo "  ✓ пароль root изменён"; fi

# 6. Тестовое уведомление в Telegram
if [ -n "$TOKEN" ] && [ -n "$CHAT" ]; then
  curl -s -o /dev/null "https://api.telegram.org/bot$TOKEN/sendMessage" --data-urlencode chat_id="$CHAT" --data-urlencode text="✅ Магазин snovaniel.ru подключён к уведомлениям" && echo "  ✓ тестовое сообщение отправлено в Telegram"
fi

shred -u "$F" 2>/dev/null || rm -f "$F"
REMOTE

shred -u "$SECRETS" 2>/dev/null || rm -f "$SECRETS"
echo "🧹 Файл с секретами удалён локально и на сервере"
echo "✅ Готово"
