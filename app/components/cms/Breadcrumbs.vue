<template>
	<nav v-if="breadcrumbs.length > 1" class="flex items-center gap-2 text-sm text-gray-500 mb-4">
		<template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
			<NuxtLink
				v-if="index < breadcrumbs.length - 1"
				:to="crumb.path"
				class="hover:text-plaza-600 transition-colors"
			>
				{{ crumb.label }}
			</NuxtLink>
			<span v-else class="text-gray-900 font-medium">
				{{ crumb.label }}
			</span>
			<svg
				v-if="index < breadcrumbs.length - 1"
				class="w-4 h-4 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5l7 7-7 7"
				/>
			</svg>
		</template>
	</nav>
</template>

<script setup lang="ts">
const route = useRoute()
const { t: _t } = useI18n()

interface Breadcrumb {
	path: string
	label: string
}

// Mapování cest na názvy
const pathLabels: Record<string, string> = {
	cms: 'Dashboard',
	'hlavni-stranka': 'Hlavní stránka',
	kategorie: 'Kategorie',
	obchody: 'Obchody',
	patra: 'Patra',
	mapa: 'Mapa',
	akce: 'Akce',
	novinky: 'Novinky',
	sluzby: 'Služby',
	'o-nas': 'Obecné informace',
	spravci: 'Správci',
	ucet: 'Účet',
	novy: 'Nový',
	upravit: 'Upravit',
}

const breadcrumbs = computed<Breadcrumb[]>(() => {
	const pathParts = route.path.split('/').filter(Boolean)
	const crumbs: Breadcrumb[] = []

	let currentPath = ''
	for (const part of pathParts) {
		currentPath += `/${part}`

		// Přeskočit dynamické parametry (MongoDB ID apod.)
		if (/^[a-f0-9]{24}$/i.test(part)) {
			continue
		}

		const label = pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1)
		crumbs.push({
			path: currentPath,
			label,
		})
	}

	return crumbs
})
</script>
