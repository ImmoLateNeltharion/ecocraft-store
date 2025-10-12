-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BLANKET', 'SHOPPER');

-- CreateEnum
CREATE TYPE "Material" AS ENUM ('LINEN', 'COTTON', 'WOOL', 'BAMBOO', 'RECYCLED', 'NETTLE', 'MUSLIN', 'FLANNEL');

-- CreateEnum
CREATE TYPE "Warmth" AS ENUM ('LIGHT', 'MEDIUM', 'WARM');

-- CreateEnum
CREATE TYPE "Pattern" AS ENUM ('SOLID', 'STRIPED', 'CHECKERED', 'GEOMETRIC', 'FLORAL');

-- CreateEnum
CREATE TYPE "EcoTag" AS ENUM ('HANDMADE', 'NATURAL_DYES', 'SMALL_BATCH', 'ZERO_PLASTIC_PACKAGING', 'ORGANIC', 'RECYCLED_MATERIALS', 'LOCAL_PRODUCTION');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "material" "Material" NOT NULL,
    "warmth" "Warmth",
    "color" TEXT,
    "pattern" "Pattern",
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "ecoTags" "EcoTag"[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "inStock" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size" ADD CONSTRAINT "Size_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
