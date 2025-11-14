-- Добавляем новый массив материалов и переносим существующие данные
ALTER TABLE "Product"
ADD COLUMN "materials" "Material"[] DEFAULT ARRAY[]::"Material"[];

UPDATE "Product"
SET "materials" = ARRAY["material"];

ALTER TABLE "Product"
ALTER COLUMN "materials" SET NOT NULL;

ALTER TABLE "Product"
DROP COLUMN "material";

