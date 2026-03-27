import type { Shop } from '@/shared/types'

declare global {
	interface Window {
		dataLayer: Record<string, unknown>[]
	}
}

function push(event: Record<string, unknown>) {
	if (import.meta.server) return
	window.dataLayer = window.dataLayer || []
	window.dataLayer.push(event)
}

export function useDataLayer() {
	function trackShopClick(
		shop: Pick<Shop, 'name' | 'slug'> & {
			category?: { name: string } | null
			floor?: { name: string } | null
		},
	) {
		push({
			event: 'shop_click',
			shop_name: shop.name,
			shop_slug: shop.slug,
			shop_category: shop.category?.name ?? undefined,
			shop_floor: shop.floor?.name ?? undefined,
		})
	}

	function trackShopView(
		shop: Pick<Shop, 'name' | 'slug'> & {
			category?: { name: string } | null
			floor?: { name: string } | null
		},
	) {
		push({
			event: 'shop_view',
			shop_name: shop.name,
			shop_slug: shop.slug,
			shop_category: shop.category?.name ?? undefined,
			shop_floor: shop.floor?.name ?? undefined,
		})
	}

	function trackEventClick(event: { name: string; date?: string | null }) {
		push({
			event: 'event_click',
			event_name: event.name,
			event_date: event.date ?? undefined,
		})
	}

	function trackContactClick(type: 'phone' | 'email' | 'website', shopName?: string) {
		push({
			event: 'contact_click',
			contact_type: type,
			shop_name: shopName ?? undefined,
		})
	}

	return {
		trackShopClick,
		trackShopView,
		trackEventClick,
		trackContactClick,
	}
}
