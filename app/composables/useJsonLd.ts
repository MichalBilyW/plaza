/**
 * Helper composable pro vkládání schema.org JSON-LD strukturovaných dat.
 * Vkládá `<script type="application/ld+json">` do `<head>` pomocí `useHead`.
 *
 * Příklad:
 *   useJsonLd({ '@context': 'https://schema.org', '@type': 'Organization', ... })
 *
 * Lze předat pole více objektů — vznikne víc `<script>` tagů (Google podporuje obě varianty).
 */

type JsonLdObject = Record<string, unknown>

export function useJsonLd(data: JsonLdObject | JsonLdObject[]): void {
	const items = Array.isArray(data) ? data : [data]

	useHead({
		script: items.map((item, idx) => ({
			key: `jsonld-${idx}-${(item['@type'] as string) || 'unknown'}`,
			type: 'application/ld+json',
			innerHTML: JSON.stringify(item),
		})),
	})
}

// ────────────────────────────────────────────────────────────────────
// Builders pro běžné typy
// ────────────────────────────────────────────────────────────────────

interface OpeningHoursLike {
	day: string
	open: string
	close: string
	closed?: boolean
}

const DAY_TO_SCHEMA: Record<string, string> = {
	monday: 'Mo',
	tuesday: 'Tu',
	wednesday: 'We',
	thursday: 'Th',
	friday: 'Fr',
	saturday: 'Sa',
	sunday: 'Su',
}

/**
 * Převede pole otevíracích hodin na schema.org formát:
 *   ["Mo-Fr 09:00-21:00", "Sa 09:00-21:00", "Su 09:00-20:00"]
 *
 * Sloučí navazující dny se stejným časem do range (Mo-Fr).
 */
export function openingHoursToSchemaSpec(
	hours: OpeningHoursLike[] | undefined,
): string[] | undefined {
	if (!hours || hours.length === 0) return undefined

	// Setřídit podle pořadí dní v týdnu
	const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
	const sorted = [...hours]
		.filter((h) => !h.closed && h.open && h.close && DAY_TO_SCHEMA[h.day])
		.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day))

	if (sorted.length === 0) return undefined

	// Sloučit navazující dny se stejnou otvírací dobou
	const result: string[] = []
	let groupStart = sorted[0]!
	let groupEnd = sorted[0]!

	for (let i = 1; i < sorted.length; i++) {
		const curr = sorted[i]!
		const sameTime = curr.open === groupEnd.open && curr.close === groupEnd.close
		const consecutive = order.indexOf(curr.day) === order.indexOf(groupEnd.day) + 1
		if (sameTime && consecutive) {
			groupEnd = curr
		} else {
			result.push(formatDayRange(groupStart, groupEnd))
			groupStart = curr
			groupEnd = curr
		}
	}
	result.push(formatDayRange(groupStart, groupEnd))
	return result
}

function formatDayRange(start: OpeningHoursLike, end: OpeningHoursLike): string {
	const startCode = DAY_TO_SCHEMA[start.day]
	const endCode = DAY_TO_SCHEMA[end.day]
	const range = startCode === endCode ? startCode : `${startCode}-${endCode}`
	return `${range} ${start.open}-${start.close}`
}

interface BreadcrumbItem {
	name: string
	url: string
}

/** Builder pro BreadcrumbList. Předej pole položek od kořene k aktuální stránce. */
export function buildBreadcrumbList(items: BreadcrumbItem[]): JsonLdObject {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, idx) => ({
			'@type': 'ListItem',
			position: idx + 1,
			name: item.name,
			item: item.url,
		})),
	}
}
