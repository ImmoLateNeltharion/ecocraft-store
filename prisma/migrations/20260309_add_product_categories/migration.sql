-- Добавление новых значений в enum Category
-- Выполнить вручную в psql после восстановления PostgreSQL

ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'CHILDREN';
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'STANDARD';
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'CARPET_PLANE';
