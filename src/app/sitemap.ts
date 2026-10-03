import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE } from '@/lib/site'

// Строится по запросу, а не при сборке образа: на этапе build базы нет
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.productCategory.findMany({ select: { id: true } })
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/catalog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: 'monthly', priority: 0.5 }
  ]

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${SITE.url}/catalog?category=${c.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    })),
    ...products.map((p) => ({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))
  ]
}
