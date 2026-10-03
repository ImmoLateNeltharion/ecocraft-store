#!/usr/bin/env bash
# Бэкап базы и загруженных фото в ./backups/. Добавьте в cron:
#   0 3 * * * /opt/ecocraft-store/deploy/backup.sh >/dev/null 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

mkdir -p backups
STAMP="$(date +%F_%H-%M)"
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-ecocraft}" "${POSTGRES_DB:-ecocraft}" | gzip > "backups/db_$STAMP.sql.gz"
docker run --rm -v "$(basename "$(pwd)")_product_images:/img:ro" -v "$(basename "$(pwd)")_uploads:/up:ro" -v "$(pwd)/backups:/out" alpine \
  tar czf "/out/images_$STAMP.tar.gz" -C / img up

# Храним 14 последних
ls -1t backups/db_*.sql.gz | tail -n +15 | xargs -r rm -f
ls -1t backups/images_*.tar.gz | tail -n +15 | xargs -r rm -f
echo "✅ backups/db_$STAMP.sql.gz, backups/images_$STAMP.tar.gz"
