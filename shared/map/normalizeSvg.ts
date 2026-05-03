/**
 * Normalizace SVG mapy: zajistí, že každý <g class="map-unit"> má
 * pojmenované child elementy `fill` a `outline`.
 *
 * Důvod: Adobe Illustrator při exportu nepřidá `id`/`data-name` k objektům,
 * které mají defaultní název (`<Path>` v Layers panelu). To se projevuje tak,
 * že CSS selektor `path[data-name='outline']` neaplikuje styly a jednotka má
 * defaultní černý stroke prohlížeče místo plaza-barvy.
 *
 * Tato funkce projde všechny `.map-unit` skupiny a doplní chybějící
 * `data-name="fill"` (první shape) a `data-name="outline"` (poslední shape),
 * pokud ještě nejsou nastavené.
 *
 * Spouští se ve dvou místech:
 *  - `MapFloor.vue` po každém renderu SVG do DOMu
 *  - `useMapExport.ts` po vložení SVG do offscreen kontejneru
 */
export function normalizeMapUnitsSvg(svg: SVGSVGElement | HTMLElement | null): void {
	if (!svg) return

	const units = svg.querySelectorAll<SVGGElement>('g.map-unit')
	for (const unit of units) {
		const shapes = Array.from(unit.children).filter(
			(child) => child instanceof SVGPathElement || child instanceof SVGRectElement,
		) as (SVGPathElement | SVGRectElement)[]

		if (shapes.length === 0) continue

		const first = shapes[0]!
		const last = shapes[shapes.length - 1]!

		// První shape = fill (pokud nemá data-name)
		if (!first.getAttribute('data-name')) {
			first.setAttribute('data-name', 'fill')
		}

		// Poslední shape = outline (pokud nemá data-name a není totožný s prvním)
		if (last !== first && !last.getAttribute('data-name')) {
			last.setAttribute('data-name', 'outline')
		}
	}
}
