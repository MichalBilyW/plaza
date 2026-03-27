/**
 * GET /api/__sitemap__/urls
 * Dynamické URL pro sitemapu - obchody
 *
 * Akce a novinky nemají vlastní stránky (zobrazují se v modálech),
 * proto nejsou v sitemapě.
 */

import { connectToDatabase } from '@/server/utils/db'
import { Shop } from '@/server/models'
import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
	await connectToDatabase()

	const urls: ReturnType<typeof asSitemapUrl>[] = []

	// Obchody - pouze aktivní
	const shops = await Shop.find({ isActive: true }).select('slug updatedAt').lean()
	for (const shop of shops) {
		urls.push(
			asSitemapUrl({
				loc: `/obchody/${shop.slug}`,
				lastmod: shop.updatedAt,
				changefreq: 'weekly',
				priority: 0.8,
			}),
		)
	}

	return urls
})
