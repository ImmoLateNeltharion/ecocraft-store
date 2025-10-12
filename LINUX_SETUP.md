# 🐧 Запуск проекта на чистом Linux

## Что нужно установить:

### 1. Node.js 18+
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка
node --version  # должно быть v18 или выше
npm --version
```

### 2. PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Запуск PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Проверка
sudo systemctl status postgresql
```

### 3. Git (если нужно)
```bash
sudo apt install git
```

---

## Настройка PostgreSQL:

### 1. Создай пользователя и базу данных:
```bash
# Переключись на пользователя postgres
sudo -u postgres psql

# В консоли PostgreSQL выполни:
CREATE USER ecocraft WITH PASSWORD 'твой_пароль';
CREATE DATABASE ecocraft OWNER ecocraft;
GRANT ALL PRIVILEGES ON DATABASE ecocraft TO ecocraft;
\q
```

### 2. Или используй пользователя postgres:
```bash
sudo -u postgres psql
CREATE DATABASE ecocraft;
\q
```

---

## Установка проекта:

### 1. Скопируй проект на Linux:
```bash
# Если используешь Git
git clone <repository-url>
cd ecocraft-store

# Или скопируй папку с Windows через scp/sftp
```

### 2. Установи зависимости:
```bash
npm install
```

### 3. Создай файл .env:
```bash
cp .env.example .env
nano .env
```

Содержимое `.env`:
```env
DATABASE_URL="postgresql://ecocraft:твой_пароль@localhost:5432/ecocraft?schema=public"
SITE_URL="http://localhost:3000"
```

Или если используешь пользователя postgres:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecocraft?schema=public"
SITE_URL="http://localhost:3000"
```

### 4. Примени миграции:
```bash
npm run prisma:migrate
```

### 5. Добавь тестовые данные:
```bash
npm run prisma:seed
```

### 6. Запусти сервер:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## Запуск в продакшн (на сервере):

### 1. Установи PM2 (менеджер процессов):
```bash
sudo npm install -g pm2
```

### 2. Собери проект:
```bash
npm run build
```

### 3. Запусти через PM2:
```bash
pm2 start npm --name "ecocraft" -- start
pm2 save
pm2 startup
```

### 4. Управление:
```bash
pm2 status          # Статус
pm2 logs ecocraft   # Логи
pm2 restart ecocraft # Перезапуск
pm2 stop ecocraft   # Остановка
```

---

## Настройка Nginx (опционально):

### 1. Установи Nginx:
```bash
sudo apt install nginx
```

### 2. Создай конфиг:
```bash
sudo nano /etc/nginx/sites-available/ecocraft
```

Содержимое:
```nginx
server {
    listen 80;
    server_name твой_домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Активируй конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/ecocraft /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Настройка SSL (Let's Encrypt):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d твой_домен.ru
```

---

## Полезные команды:

### PostgreSQL:
```bash
# Подключиться к БД
sudo -u postgres psql ecocraft

# Посмотреть таблицы
\dt

# Выйти
\q
```

### Логи:
```bash
# Логи Next.js
pm2 logs ecocraft

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Обновление проекта:
```bash
git pull                # Получить изменения
npm install             # Обновить зависимости
npm run prisma:migrate  # Применить миграции
npm run build           # Собрать проект
pm2 restart ecocraft    # Перезапустить
```

---

## Firewall (опционально):

```bash
# Разреши нужные порты
sudo ufw allow 22        # SSH
sudo ufw allow 80        # HTTP
sudo ufw allow 443       # HTTPS
sudo ufw enable
```

---

## Проблемы и решения:

### Ошибка подключения к PostgreSQL:
```bash
# Проверь статус
sudo systemctl status postgresql

# Перезапусти
sudo systemctl restart postgresql

# Проверь, слушает ли порт
sudo netstat -plunt | grep 5432
```

### Порт 3000 занят:
```bash
# Найди процесс
sudo lsof -i :3000

# Убей процесс
sudo kill -9 PID
```

### Права доступа:
```bash
# Дай права на папку проекта
sudo chown -R $USER:$USER /path/to/ecocraft-store
```

---

## Минимальные требования сервера:

- **CPU**: 1 ядро
- **RAM**: 1 GB (рекомендуется 2 GB)
- **Disk**: 10 GB
- **OS**: Ubuntu 20.04+ / Debian 11+

---

## Быстрая установка (скрипт):

Создай файл `setup.sh`:
```bash
#!/bin/bash

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Запуск PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создание БД
sudo -u postgres psql -c "CREATE DATABASE ecocraft;"

echo "✅ Установка завершена!"
echo "Теперь выполни:"
echo "1. npm install"
echo "2. cp .env.example .env (и настрой .env)"
echo "3. npm run prisma:migrate"
echo "4. npm run prisma:seed"
echo "5. npm run dev"
```

Запусти:
```bash
chmod +x setup.sh
./setup.sh
```

---

**Готово!** Теперь сайт работает на Linux! 🎉

