/**
 * Formátovací utility pro API responses
 */

/**
 * Bezpečně převede datum na ISO string.
 * Funguje jak s mongoose Date objekty, tak s plain objekty z .lean()
 */
export function toISOString(date: Date | string | null | undefined): string | undefined {
	if (!date) return undefined
	if (typeof date === 'string') return date
	if (date instanceof Date) return date.toISOString()
	// Pro lean() výsledky, kde datum je plain objekt
	return new Date(date).toISOString()
}

/**
 * Bezpečně převede ObjectId na string
 */
export function toIdString(id: unknown): string {
	if (!id) return ''
	if (typeof id === 'string') return id
	if (typeof id === 'object' && 'toString' in id) return id.toString()
	return String(id)
}
