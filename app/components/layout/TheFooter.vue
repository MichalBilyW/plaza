<template>
	<footer class="bg-plaza-dark text-white mt-auto" role="contentinfo">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<div>
					<h2 class="text-lg font-semibold mb-4">{{ t('brand.fullName') }}</h2>
					<p class="text-plaza-gray text-sm">
						{{ t('footer.description') }}
					</p>
				</div>

				<div>
					<h2 class="font-medium mb-4">{{ t('footer.openingHours') }}</h2>
					<div class="text-plaza-gray text-sm space-y-1">
						<p>{{ t('footer.openingHoursShops') }}</p>
						<p>{{ t('footer.openingHoursHypermarket') }}</p>
					</div>
				</div>

				<div>
					<h2 class="font-medium mb-4">{{ t('footer.contact') }}</h2>
					<address class="text-plaza-gray text-sm space-y-1 not-italic">
						<p>{{ t('footer.address') }}</p>
						<p>{{ t('footer.city') }}</p>
						<p class="mt-2">
							<a
								:href="`tel:${t('footer.phone').replace(/\s/g, '')}`"
								class="hover:text-white"
							>
								{{ t('footer.phone') }}
							</a>
						</p>
					</address>
				</div>

				<div>
					<h2 class="font-medium mb-4">{{ t('footer.followUs') }}</h2>
					<div class="flex gap-4">
						<a href="#" class="text-plaza-gray hover:text-white transition-colors" aria-label="Facebook">
							{{ t('footer.facebook') }}
						</a>
						<a href="#" class="text-plaza-gray hover:text-white transition-colors" aria-label="Instagram">
							{{ t('footer.instagram') }}
						</a>
					</div>
				</div>
			</div>

			<div
				class="border-t border-plaza-gray/30 mt-8 pt-8 text-center text-plaza-gray text-sm"
			>
				<p>{{ t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
