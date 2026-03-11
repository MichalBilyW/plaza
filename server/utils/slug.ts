/**
 * Slug Utility
 *
 * Generování URL-friendly slugů z textu
 */

// Mapování českých znaků na ASCII
const czechToAscii: Record<string, string> = {
	á: 'a',
	č: 'c',
	ď: 'd',
	é: 'e',
	ě: 'e',
	í: 'i',
	ň: 'n',
	ó: 'o',
	ř: 'r',
	š: 's',
	ť: 't',
	ú: 'u',
	ů: 'u',
	ý: 'y',
	ž: 'z',
	Á: 'a',
	Č: 'c',
	Ď: 'd',
	É: 'e',
	Ě: 'e',
	Í: 'i',
	Ň: 'n',
	Ó: 'o',
	Ř: 'r',
	Š: 's',
	Ť: 't',
	Ú: 'u',
	Ů: 'u',
	Ý: 'y',
	Ž: 'z',
}

/**
 * Generuje slug z textu
 */
export function generateSlug(text: string): string {
	let slug = text.toLowerCase()

	// Nahrazení českých znaků
	for (const [czech, ascii] of Object.entries(czechToAscii)) {
		slug = slug.replace(new RegExp(czech, 'g'), ascii)
	}

	// Ostatní diakritika
	slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

	// Pouze povolené znaky
	slug = slug
		.replace(/[^a-z0-9\s-]/g, '') // Odstranění speciálních znaků
		.replace(/\s+/g, '-') // Mezery na pomlčky
		.replace(/-+/g, '-') // Vícenásobné pomlčky na jednu
		.replace(/^-|-$/g, '') // Odstranění pomlček na začátku a konci

	return slug
}

/**
 * Generuje unikátní slug s přidáním čísla pokud již existuje
 */
export async function generateUniqueSlug(
	text: string,
	checkExists: (slug: string) => Promise<boolean>,
	currentId?: string,
): Promise<string> {
	const baseSlug = generateSlug(text)
	let slug = baseSlug
	let counter = 1

	while (await checkExists(slug)) {
		// Pokud kontrolujeme existující záznam, povolíme jeho vlastní slug
		// Toto by mělo být ošetřeno v checkExists funkci
		slug = `${baseSlug}-${counter}`
		counter++

		// Bezpečnostní limit
		if (counter > 100) {
			slug = `${baseSlug}-${Date.now()}`
			break
		}
	}

	return slug
}
