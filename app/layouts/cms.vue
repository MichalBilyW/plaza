<template>
	<div class="min-h-screen flex">
		<!-- Flash Messages -->
		<CmsFlashMessages />

		<!-- Mobile header -->
		<header
			class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white px-4 py-3 flex items-center justify-between"
		>
			<NuxtLink to="/cms" class="text-lg font-bold text-plaza-400">
				<img src="/images/logo_plaza.png" alt="Plaza Liberec Logo" width="50" />
			</NuxtLink>
			<button
				@click="sidebarOpen = true"
				class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
				:aria-label="$t('common.menu')"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</header>

		<!-- Mobile overlay -->
		<Transition name="fade">
			<div
				v-if="sidebarOpen"
				class="lg:hidden fixed inset-0 bg-black/50 z-40"
				@click="sidebarOpen = false"
			></div>
		</Transition>

		<!-- Sidebar -->
		<aside
			:class="[
				'fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex-shrink-0 transform transition-transform duration-300 lg:translate-x-0',
				sidebarOpen ? 'translate-x-0' : '-translate-x-full',
			]"
		>
			<div class="p-6 flex items-center justify-between">
				<NuxtLink to="/cms" class="flex items-center gap-2" @click="sidebarOpen = false">
					<img src="/images/logo_plaza.png" :alt="$t('common.altLogo')" width="100" />
				</NuxtLink>
				<button
					@click="sidebarOpen = false"
					class="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<nav class="mt-6">
				<div class="px-3 space-y-1">
					<NuxtLink
						to="/cms"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
						:class="{ 'bg-gray-800': $route.path === '/cms' }"
						@click="sidebarOpen = false"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
							/>
						</svg>
						{{ $t('cms.sidebar.dashboard') }}
					</NuxtLink>

					<NuxtLink
						to="/cms/hlavni-stranka"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
						:class="{ 'bg-gray-800': $route.path.startsWith('/cms/hlavni-stranka') }"
						@click="sidebarOpen = false"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						{{ $t('cms.sidebar.homepage') }}
					</NuxtLink>

					<NuxtLink
						to="/cms/kategorie"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-purple-900/30 transition-colors group"
						:class="
							$route.path.startsWith('/cms/kategorie')
								? 'bg-purple-900/40 border-l-2 border-purple-400'
								: ''
						"
						@click="sidebarOpen = false"
					>
						<svg
							class="w-5 h-5 text-purple-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
						<span
							:class="
								$route.path.startsWith('/cms/kategorie')
									? 'text-purple-300'
									: 'group-hover:text-purple-300'
							"
							>{{ $t('cms.sidebar.categories') }}</span
						>
					</NuxtLink>

					<NuxtLink
						to="/cms/obchody"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-cms-shops-900/30 transition-colors group"
						:class="
							$route.path.startsWith('/cms/obchody')
								? 'bg-cms-shops-900/40 border-l-2 border-cms-shops-400'
								: ''
						"
						@click="sidebarOpen = false"
					>
						<svg
							class="w-5 h-5 text-cms-shops-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						<span
							:class="
								$route.path.startsWith('/cms/obchody')
									? 'text-cms-shops-300'
									: 'group-hover:text-cms-shops-300'
							"
							>{{ $t('cms.sidebar.shops') }}</span
						>
					</NuxtLink>

					<NuxtLink
						to="/cms/patra"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
						:class="{ 'bg-gray-800': $route.path.startsWith('/cms/patra') }"
						@click="sidebarOpen = false"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						{{ $t('cms.sidebar.floors') }}
					</NuxtLink>

					<NuxtLink
						to="/cms/mapa"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
						:class="{ 'bg-gray-800': $route.path.startsWith('/cms/mapa') }"
						@click="sidebarOpen = false"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5a1 1 0 011-1h2a1 1 0 011 1v11.382a1 1 0 01.553.894l-.003.316c-.005.248-.01.494-.01.736a1 1 0 001.447.894L15 18m6-2l-5.447 2.724A1 1 0 0113 16.382V5a1 1 0 011-1h2a1 1 0 011 1v11.382a1 1 0 01.553.894l-.003.316c-.005.248-.01.494-.01.736a1 1 0 001.447.894L21 18z"
							/>
						</svg>
						{{ $t('cms.sidebar.map') }}
					</NuxtLink>

					<NuxtLink
						to="/cms/akce"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-cms-events-900/30 transition-colors group"
						:class="
							$route.path.startsWith('/cms/akce')
								? 'bg-cms-events-900/40 border-l-2 border-cms-events-400'
								: ''
						"
						@click="sidebarOpen = false"
					>
						<svg
							class="w-5 h-5 text-cms-events-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span
							:class="
								$route.path.startsWith('/cms/akce')
									? 'text-cms-events-300'
									: 'group-hover:text-cms-events-300'
							"
							>{{ $t('cms.sidebar.events') }}</span
						>
					</NuxtLink>

					<NuxtLink
						to="/cms/novinky"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-cms-news-900/30 transition-colors group"
						:class="
							$route.path.startsWith('/cms/novinky')
								? 'bg-cms-news-900/40 border-l-2 border-cms-news-400'
								: ''
						"
						@click="sidebarOpen = false"
					>
						<svg
							class="w-5 h-5 text-cms-news-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
							/>
						</svg>
						<span
							:class="
								$route.path.startsWith('/cms/novinky')
									? 'text-cms-news-300'
									: 'group-hover:text-cms-news-300'
							"
							>{{ $t('cms.sidebar.news') }}</span
						>
					</NuxtLink>

					<NuxtLink
						to="/cms/sluzby"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-cms-services-900/30 transition-colors group"
						:class="
							$route.path.startsWith('/cms/sluzby')
								? 'bg-cms-services-900/40 border-l-2 border-cms-services-400'
								: ''
						"
						@click="sidebarOpen = false"
					>
						<svg
							class="w-5 h-5 text-cms-services-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						<span
							:class="
								$route.path.startsWith('/cms/sluzby')
									? 'text-cms-services-300'
									: 'group-hover:text-cms-services-300'
							"
							>{{ $t('cms.sidebar.services') }}</span
						>
					</NuxtLink>

					<NuxtLink
						to="/cms/obecne-informace"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
						:class="{ 'bg-gray-800': $route.path.startsWith('/cms/obecne-informace') }"
						@click="sidebarOpen = false"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						{{ $t('cms.sidebar.generalInfo') }}
					</NuxtLink>

					<NuxtLink
						v-if="isAdmin"
						to="/cms/spravci"
						class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors"
						:class="{ 'bg-gray-800': $route.path.startsWith('/cms/spravci') }"
						@click="sidebarOpen = false"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
						{{ $t('cms.sidebar.users') }}
					</NuxtLink>
				</div>
			</nav>

			<!-- User info -->
			<div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 w-64">
				<div class="flex items-center gap-3">
					<NuxtLink
						to="/cms/ucet"
						class="w-8 h-8 rounded-full bg-plaza flex items-center justify-center text-sm font-medium hover:bg-plaza transition-colors"
						@click="sidebarOpen = false"
					>
						{{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
					</NuxtLink>
					<NuxtLink
						to="/cms/ucet"
						class="flex-1 min-w-0 hover:opacity-80 transition-opacity"
						@click="sidebarOpen = false"
					>
						<p class="text-sm font-medium truncate">{{ user?.name }}</p>
						<p class="text-xs text-gray-400">
							{{
								user?.role === 'admin'
									? $t('cms.roles.admin')
									: $t('cms.roles.editor')
							}}
						</p>
					</NuxtLink>
					<button
						@click="logout"
						class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
						:title="$t('cms.actions.logout')"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</div>
			</div>
		</aside>

		<!-- Main content -->
		<main class="flex-1 bg-gray-100 min-h-screen overflow-auto pt-14 lg:pt-0">
			<slot ></slot>
		</main>
	</div>
</template>

<script setup lang="ts">
const { user, isAdmin, logout } = useCmsAuth()
const sidebarOpen = ref(false)

// Zavřít sidebar při změně route
const route = useRoute()
watch(
	() => route.path,
	() => {
		sidebarOpen.value = false
	},
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>

<style>
/* Custom CMS Checkbox Styles */
input[type='checkbox'] {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	width: 1.25rem;
	height: 1.25rem;
	min-width: 1.25rem;
	min-height: 1.25rem;
	border: 2px solid #d1d5db;
	border-radius: 0.375rem;
	background-color: white;
	cursor: pointer;
	position: relative;
	transition: all 0.15s ease-in-out;
}

input[type='checkbox']:hover {
	border-color: #9ca3af;
}

input[type='checkbox']:focus {
	outline: none;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
	border-color: #3b82f6;
}

input[type='checkbox']:checked {
	background-color: #3b82f6;
	border-color: #3b82f6;
}

input[type='checkbox']:checked::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -60%) rotate(45deg);
	width: 0.3rem;
	height: 0.6rem;
	border: solid white;
	border-width: 0 2px 2px 0;
}

/* Disabled state */
input[type='checkbox']:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Color variants using Tailwind's text color classes */
input[type='checkbox'].text-cms-shops-600:checked,
input[type='checkbox'][class*='text-cms-shops']:checked {
	background-color: #0891b2;
	border-color: #0891b2;
}

input[type='checkbox'].text-cms-categories-600:checked,
input[type='checkbox'][class*='text-cms-categories']:checked {
	background-color: #7c3aed;
	border-color: #7c3aed;
}

input[type='checkbox'].text-cms-events-600:checked,
input[type='checkbox'][class*='text-cms-events']:checked {
	background-color: #ea580c;
	border-color: #ea580c;
}

input[type='checkbox'].text-cms-services-600:checked,
input[type='checkbox'][class*='text-cms-services']:checked {
	background-color: #16a34a;
	border-color: #16a34a;
}

/* Focus ring color variants */
input[type='checkbox'].focus\:ring-cms-shops-500:focus {
	box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.3);
}

input[type='checkbox'].focus\:ring-cms-categories-500:focus {
	box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3);
}

input[type='checkbox'].focus\:ring-cms-events-500:focus {
	box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.3);
}

input[type='checkbox'].focus\:ring-cms-services-500:focus {
	box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.3);
}

/* Responsive - slightly smaller on mobile */
@media (max-width: 640px) {
	input[type='checkbox'] {
		width: 1.125rem;
		height: 1.125rem;
		min-width: 1.125rem;
		min-height: 1.125rem;
	}

	input[type='checkbox']:checked::after {
		width: 0.25rem;
		height: 0.5rem;
	}
}
</style>
