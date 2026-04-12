/**
 * Composable pro persistenci filtrů při navigaci
 *
 * Ukládá filtry do sessionStorage, takže zůstanou zachovány
 * i po redirectu na detail a zpět.
 */

interface FilterState {
	[key: string]: string | number | boolean | null | undefined
}

export function useFilterPersistence(pageKey: string) {
	const route = useRoute()
	const router = useRouter()

	const STORAGE_KEY = `plaza-filters-${pageKey}`

	/**
	 * Uloží filtry do sessionStorage
	 */
	const saveFilters = (filters: FilterState) => {
		if (import.meta.client) {
			const cleanFilters: FilterState = {}
			for (const [key, value] of Object.entries(filters)) {
				if (value !== undefined && value !== null && value !== '') {
					cleanFilters[key] = value
				}
			}
			if (Object.keys(cleanFilters).length > 0) {
				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cleanFilters))
			} else {
				sessionStorage.removeItem(STORAGE_KEY)
			}
		}
	}

	/**
	 * Načte filtry ze sessionStorage nebo z URL
	 */
	const loadFilters = <T extends FilterState>(defaults: T): T => {
		// Nejprve zkontroluj URL parametry
		const urlFilters: FilterState = {}
		for (const key of Object.keys(defaults)) {
			if (route.query[key] !== undefined) {
				urlFilters[key] = route.query[key] as string
			}
		}

		// Pokud jsou v URL, použij je
		if (Object.keys(urlFilters).length > 0) {
			return { ...defaults, ...urlFilters } as T
		}

		// Jinak zkus sessionStorage
		if (import.meta.client) {
			const stored = sessionStorage.getItem(STORAGE_KEY)
			if (stored) {
				try {
					const parsed = JSON.parse(stored)
					return { ...defaults, ...parsed } as T
				} catch {
					// ignore parse errors
				}
			}
		}

		return defaults
	}

	/**
	 * Synchronizuje filtry do URL a sessionStorage
	 */
	const syncFilters = (filters: FilterState) => {
		// Ulož do sessionStorage
		saveFilters(filters)

		// Aktualizuj URL
		const query: Record<string, string> = {}
		for (const [key, value] of Object.entries(filters)) {
			if (value !== undefined && value !== null && value !== '') {
				query[key] = String(value)
			}
		}

		router.replace({ query })
	}

	/**
	 * Vymaže uložené filtry
	 */
	const clearFilters = () => {
		if (import.meta.client) {
			sessionStorage.removeItem(STORAGE_KEY)
		}
		router.replace({ query: {} })
	}

	return {
		saveFilters,
		loadFilters,
		syncFilters,
		clearFilters,
	}
}
