-- 1. Категории: enum "Category" -> текстовое поле + таблица ProductCategory.
--    На проде это делалось вручную, поэтому все шаги идемпотентны.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Category') THEN
    ALTER TABLE "Product" ALTER COLUMN "category" TYPE TEXT USING "category"::text;
    DROP TYPE "Category";
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProductCategory" (
    "id"    TEXT    NOT NULL,
    "name"  TEXT    NOT NULL,
    "slug"  TEXT    NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- Базовые категории (те, на которые ссылается главная страница)
INSERT INTO "ProductCategory" ("id", "name", "slug", "order") VALUES
  ('CHILDREN',     'Детские одеяла',          'CHILDREN',     1),
  ('STANDARD',     'Одеяла стандарт',         'STANDARD',     2),
  ('CARPET_PLANE', 'Одеяло «Ковёр-самолёт»',  'CARPET_PLANE', 3),
  ('BLANKET',      'Пледы',                   'BLANKET',      4),
  ('SHOPPER',      'Шоперы + мешочки',        'SHOPPER',      5)
ON CONFLICT ("id") DO NOTHING;

-- 2. Позиции заказа: ссылки на товар и размер для списания остатков
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "sizeId"    TEXT;

-- 3. Сессии админа
CREATE TABLE IF NOT EXISTS "AdminSession" (
    "id"        TEXT         NOT NULL,
    "token"     TEXT         NOT NULL,
    "adminId"   TEXT         NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdminSession_token_key" ON "AdminSession"("token");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AdminSession_adminId_fkey') THEN
    ALTER TABLE "AdminSession"
      ADD CONSTRAINT "AdminSession_adminId_fkey"
      FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. Сообщения с формы обратной связи
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "email"     TEXT         NOT NULL,
    "phone"     TEXT,
    "subject"   TEXT         NOT NULL,
    "message"   TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
