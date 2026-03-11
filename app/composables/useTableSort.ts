/**
 * Composable pro řazení tabulek v CMS
 *
 * Podporuje 3 stavy řazení:
 * 1. klik = vzestupně (asc)
 * 2. klik = sestupně (desc)
 * 3. klik = reset (bez řazení)
 */

type SortDirection = 'asc' | 'desc' | null

interface SortState {
	field: string | null
	direction: SortDirection
}

// Helper to get nested value from object using dot notation or custom getter
function getValue<T>(obj: T, field: string): unknown {
	// Special handling for known nested fields
	if (field === 'floor' && obj && typeof obj === 'object' && 'floor' in obj) {
		const floor = (obj as { floor: { name?: string } | null }).floor
		return floor?.name ?? null
	}

	// Default: direct field access
	return (obj as Record<string, unknown>)[field]
}

export function useTableSort<T>(
	items: Ref<T[]>,
	defaultSort?: { field: keyof T; direction: SortDirection },
) {
	const sortState = ref<SortState>({
		field: (defaultSort?.field as string | null) ?? null,
		direction: defaultSort?.direction ?? null,
	})

	const toggleSort = (field: string) => {
		if (sortState.value.field !== field) {
			// Nový sloupec - začínáme vzestupně
			sortState.value = { field, direction: 'asc' }
		} else if (sortState.value.direction === 'asc') {
			// Vzestupně -> Sestupně
			sortState.value.direction = 'desc'
		} else if (sortState.value.direction === 'desc') {
			// Sestupně -> Reset
			sortState.value = { field: null, direction: null }
		} else {
			// Reset -> Vzestupně
			sortState.value = { field, direction: 'asc' }
		}
	}

	const getSortIcon = (field: string): 'asc' | 'desc' | null => {
		if (sortState.value.field !== field) return null
		return sortState.value.direction
	}

	const sortedItems = computed(() => {
		if (!sortState.value.field || !sortState.value.direction) {
			return items.value
		}

		const field = sortState.value.field
		const direction = sortState.value.direction

		return [...items.value].sort((a, b) => {
			const aVal = getValue(a, field)
			const bVal = getValue(b, field)

			// Boolean comparison
			if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
				const result = aVal === bVal ? 0 : aVal ? -1 : 1
				return direction === 'asc' ? result : -result
			}

			// Date comparison (for ISO strings)
			if (
				typeof aVal === 'string' &&
				typeof bVal === 'string' &&
				/^\d{4}-\d{2}-\d{2}/.test(aVal) &&
				/^\d{4}-\d{2}-\d{2}/.test(bVal)
			) {
				const dateA = new Date(aVal).getTime()
				const dateB = new Date(bVal).getTime()
				return direction === 'asc' ? dateA - dateB : dateB - dateA
			}

			// Default string comparison
			const result = String(aVal).localeCompare(String(bVal), 'cs')
			return direction === 'asc' ? result : -result
		})
	})

	return {
		sortState: readonly(sortState),
		toggleSort,
		getSortIcon,
		sortedItems,
	}
}
