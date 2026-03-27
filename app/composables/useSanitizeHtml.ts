/**
 * Composable pro sanitizaci HTML obsahu proti XSS útokům
 * Používá DOMPurify pro bezpečné renderování HTML z WYSIWYG editoru
 */

import DOMPurify from 'dompurify'

export function useSanitizeHtml() {
	/**
	 * Sanitizuje HTML string a odstraní potenciálně nebezpečný obsah
	 * Povoluje pouze bezpečné HTML tagy a atributy
	 */
	const sanitize = (dirty: string | null | undefined): string => {
		if (!dirty) return ''

		// Pouze na klientovi - DOMPurify vyžaduje DOM
		if (import.meta.server) {
			// Na serveru vrátíme prázdný string - obsah se doplní na klientovi
			return ''
		}

		return DOMPurify.sanitize(dirty, {
			// Povolené HTML tagy
			ALLOWED_TAGS: [
				'p',
				'br',
				'b',
				'strong',
				'i',
				'em',
				'u',
				's',
				'strike',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
				'ul',
				'ol',
				'li',
				'a',
				'img',
				'blockquote',
				'hr',
				'table',
				'thead',
				'tbody',
				'tr',
				'th',
				'td',
				'span',
				'div',
				'figure',
				'figcaption',
			],
			// Povolené atributy
			ALLOWED_ATTR: [
				'href',
				'target',
				'rel',
				'src',
				'alt',
				'title',
				'class',
				'style',
				'width',
				'height',
				'colspan',
				'rowspan',
			],
			// Zakázat javascript: URL
			ALLOW_DATA_ATTR: false,
			// Přidat rel="noopener noreferrer" k externím odkazům
			ADD_ATTR: ['rel'],
		})
	}

	return {
		sanitize,
	}
}
