-- Добавление новых значений в enum Category.
-- На базах, где enum уже заменён на текст (см. следующую миграцию), пропускается.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Category') THEN
    ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'CHILDREN';
    ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'STANDARD';
    ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'CARPET_PLANE';
  END IF;
END $$;
