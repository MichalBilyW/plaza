<template>
	<section class="py-16 bg-plaza-light">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center mb-8">
				<h2 class="text-2xl font-bold">{{ t('home.sections.events') }}</h2>
				<NuxtLink to="/akce" class="text-plaza hover:text-plaza/80 font-medium">
					{{ t('common.showAllArrow') }}
				</NuxtLink>
			</div>

			<!-- Events skeleton -->
			<div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div v-for="i in 3" :key="i" class="bg-white rounded-xl overflow-hidden shadow-sm">
					<div class="h-48 skeleton-shimmer"></div>
					<div class="p-6">
						<div class="h-4 skeleton-shimmer rounded w-1/3 mb-3"></div>
						<div class="h-5 skeleton-shimmer rounded w-3/4"></div>
					</div>
				</div>
			</div>

			<!-- Empty state -->
			<div v-else-if="events.length === 0" class="text-center py-12 text-plaza-gray">
				{{ t('events.noEvents') }}
			</div>

			<!-- Events with fade-in -->
			<TransitionGroup
				v-else
				name="fade-stagger"
				tag="div"
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				<NuxtLink
					v-for="event in events"
					:key="event._id"
					:to="event.shop?.slug ? `/obchody/${event.shop.slug}` : '#'"
					class="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
				>
					<div class="h-48 bg-plaza-light flex items-center justify-center">
						<img
							v-if="event.image"
							:src="event.image"
							:alt="event.name"
							loading="lazy"
							class="w-full h-full object-cover"
						/>
						<svg
							v-else
							class="w-16 h-16 text-plaza-gray"
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
					</div>
					<div class="p-6">
						<div v-if="event.shop?.name" class="text-sm text-plaza font-medium mb-2">
							{{ event.shop.name }}
						</div>
						<h3 class="font-semibold group-hover:text-plaza transition-colors">
							{{ event.name }}
						</h3>
					</div>
				</NuxtLink>
			</TransitionGroup>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Event } from '@/shared/types'

const { t } = useI18n()

defineProps<{
	events: Event[]
	pending: boolean
}>()
</script>
