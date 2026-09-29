-- Короткие номера заказов: вместо cuid — счётчик, начиная с 1001.
-- Существующие заказы с длинными номерами не трогаем.

CREATE SEQUENCE IF NOT EXISTS "order_number_seq" START WITH 1001;

-- Если в базе уже есть числовые номера, продолжаем счёт после максимального
DO $$
DECLARE
  max_num BIGINT;
BEGIN
  SELECT MAX("orderNumber"::BIGINT) INTO max_num FROM "Order" WHERE "orderNumber" ~ '^\d+$';
  IF max_num IS NOT NULL AND max_num >= 1001 THEN
    PERFORM setval('"order_number_seq"', max_num);
  END IF;
END $$;

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET DEFAULT nextval('"order_number_seq"')::text;
