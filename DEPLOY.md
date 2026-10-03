# Развёртывание на VPS

Стек в продакшне: Docker Compose — PostgreSQL 16, приложение (Next.js standalone),
nginx с HTTPS от Let's Encrypt, certbot для автопродления.

## Требования

- VPS с Debian 12/13 или Ubuntu 22.04+, 1 ГБ RAM минимум (сборка образа ест ~1.5 ГБ — при 1 ГБ включите swap)
- Домен, A-записи `@` и `www` указывают на IP сервера
- Открыты порты 22, 80, 443

## Первая установка

```bash
# на сервере
apt update && apt install -y git
git clone https://github.com/ImmoLateNeltharion/ecocraft-store.git /opt/ecocraft-store
cd /opt/ecocraft-store
bash deploy/setup.sh        # создаст .env и остановится
nano .env                   # заполнить NEXT_PUBLIC_SITE_URL, YOOKASSA_*, TELEGRAM_*, LEGAL_*
bash deploy/setup.sh        # установит Docker, соберёт, получит сертификат, запустит
docker compose exec app node scripts/create-admin.mjs admin 'надёжный_пароль'
```

После этого сайт доступен по `https://ваш-домен`, админка — `/admin`.

## Переменные окружения

См. `.env.example`. В Docker `DATABASE_URL` собирается из `POSTGRES_*` автоматически.
`NEXT_PUBLIC_SITE_URL` нужен на этапе сборки образа — после его смены пересоберите: `bash deploy/update.sh`.

## ЮKassa

В личном кабинете ЮKassa: **Интеграция → HTTP-уведомления** → URL
`https://ваш-домен/api/payment/webhook`, события `payment.succeeded` и `payment.canceled`.
Приложение не доверяет телу уведомления и перепроверяет платёж через API ЮKassa по вашему ключу.

## Обновление

```bash
cd /opt/ecocraft-store && bash deploy/update.sh
```

Миграции применяются автоматически при старте контейнера (`prisma migrate deploy`).

## Бэкапы

```bash
bash deploy/backup.sh       # база + фото в ./backups/, хранится 14 последних
```

Восстановление базы:
```bash
gunzip -c backups/db_XXXX.sql.gz | docker compose exec -T db psql -U ecocraft -d ecocraft
```

## Полезное

```bash
docker compose ps                       # статус
docker compose logs -f app              # логи приложения
docker compose exec db psql -U ecocraft # консоль Postgres
docker compose restart app              # перезапуск
```

Фото товаров лежат в docker-volume `product_images` и `uploads`, при пересборке образа не теряются.
