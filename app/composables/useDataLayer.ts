import type { Shop } from '@/shared/types'

declare global {
	interface Window {
		dataLayer: Record<string, unknown>[]
	}
}

// Skip tracking on CMS pages
function isCmsPage(): boolean {
	if (import.meta.server) return false
	return window.location.pathname.startsWith('/cms')
}

function push(event: Record<string, unknown>) {
	if (import.meta.server) return
	if (isCmsPage()) return
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

	// === Search & Filter ===
	function trackSearch(
		query: string,
		section: 'shops' | 'events' | 'map',
		resultsCount: number,
	) {
		push({
			event: 'search',
			search_term: query,
			search_section: section,
			results_count: resultsCount,
		})
	}

	function trackFilterApply(
		filterType: 'category' | 'floor',
		filterValue: string,
		section: 'shops' | 'map',
	) {
		push({
			event: 'filter_applied',
			filter_type: filterType,
			filter_value: filterValue,
			filter_section: section,
		})
	}

	// === Map interactions ===
	function trackMapFloorSelect(floorName: string, floorNumber: number) {
		push({
			event: 'map_floor_select',
			floor_name: floorName,
			floor_number: floorNumber,
		})
	}

	function trackMapUnitClick(
		unitName: string,
		unitType: 'shop' | 'service' | 'other',
		floorName: string,
	) {
		push({
			event: 'map_unit_click',
			unit_name: unitName,
			unit_type: unitType,
			floor_name: floorName,
		})
	}

	function trackMapSearch(query: string, selectedUnit?: string) {
		push({
			event: 'map_search',
			search_term: query,
			selected_unit: selectedUnit ?? undefined,
		})
	}

	// === Modals ===
	function trackModalOpen(
		modalType: 'opening_hours' | 'event' | 'service',
		modalTitle?: string,
	) {
		push({
			event: 'modal_open',
			modal_type: modalType,
			modal_title: modalTitle ?? undefined,
		})
	}

	// === Engagement ===
	function trackGalleryInteraction(
		action: 'slide_next' | 'slide_prev' | 'dot_click',
		context: string,
		slideIndex: number,
	) {
		push({
			event: 'gallery_interaction',
			gallery_action: action,
			gallery_context: context,
			slide_index: slideIndex,
		})
	}

	function trackLoadMore(
		section: 'shops' | 'events' | 'related_shops',
		pageNumber: number,
		itemsLoaded: number,
	) {
		push({
			event: 'load_more',
			load_more_section: section,
			page_number: pageNumber,
			items_loaded: itemsLoaded,
		})
	}

	function trackCtaClick(ctaName: string, destination: string, location: string) {
		push({
			event: 'cta_click',
			cta_name: ctaName,
			cta_destination: destination,
			cta_location: location,
		})
	}

	// === Navigation ===
	function trackNavClick(navItem: string, isMobile: boolean) {
		push({
			event: 'nav_click',
			nav_item: navItem,
			is_mobile: isMobile,
		})
	}

	function trackOutboundClick(url: string, linkText: string, context: string) {
		push({
			event: 'outbound_click',
			outbound_url: url,
			link_text: linkText,
			outbound_context: context,
		})
	}

	// === View options ===
	function trackGridChange(view: 'grid' | 'list', section: string) {
		push({
			event: 'grid_change',
			grid_view: view,
			grid_section: section,
		})
	}

	function trackSliderChange(
		slideIndex: number,
		slideName: string | undefined,
		context: string,
	) {
		push({
			event: 'slider_change',
			slide_index: slideIndex,
			slide_name: slideName ?? undefined,
			slider_context: context,
		})
	}

	return {
		// Existing
		trackShopClick,
		trackShopView,
		trackEventClick,
		trackContactClick,
		// Search & Filter
		trackSearch,
		trackFilterApply,
		// Map
		trackMapFloorSelect,
		trackMapUnitClick,
		trackMapSearch,
		// Modals
		trackModalOpen,
		// Engagement
		trackGalleryInteraction,
		trackLoadMore,
		trackCtaClick,
		// Navigation
		trackNavClick,
		trackOutboundClick,
		// View options
		trackGridChange,
		trackSliderChange,
	}
}
