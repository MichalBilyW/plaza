<template>
	<div class="p-4 sm:p-6 lg:p-8">
		<CmsBreadcrumbs />
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">
					{{ t('cms.shops.editShop') }}
				</h1>
				<NuxtLink
					v-if="shop"
					:to="`/obchody/${shop.slug}`"
					target="_blank"
					class="inline-flex items-center gap-2 text-plaza-dark hover:text-gray-700 text-sm"
				>
					{{ t('cms.shops.viewOnSite') }}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</NuxtLink>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="pending" class="bg-white rounded-xl shadow-sm p-8 text-center text-plaza-dark">
			{{ t('common.loading') }}
		</div>

		<!-- Error state -->
		<div
			v-else-if="fetchError"
			class="bg-white rounded-xl shadow-sm p-8 text-center text-red-500"
		>
			{{ t('common.error') }}: {{ fetchError.message }}
		</div>

		<!-- General error -->
		<div
			v-if="generalError && !fetchError"
			class="max-w-4xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
		>
			<p class="text-sm text-red-600">{{ generalError }}</p>
		</div>

		<!-- Form -->
		<form v-if="shop && !fetchError" @submit.prevent="handleSubmit" class="space-y-8">
			<!-- Základní informace -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.basicInfo') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Název -->
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.name') }} *
						</label>
						<input
							id="name"
							v-model="form.name"
							type="text"
							required
							maxlength="200"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.namePlaceholder')"
						/>
						<p v-if="errors.name" class="mt-1 text-sm text-red-600">
							{{ errors.name }}
						</p>
					</div>

					<!-- Slug -->
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.slug') }}
						</label>
						<input
							id="slug"
							v-model="form.slug"
							type="text"
							maxlength="100"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.slugPlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">{{ t('cms.shops.slugHint') }}</p>
					</div>

					<!-- Krátký popis -->
					<div class="lg:col-span-2">
						<label
							for="shortDescription"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.shortDescription') }}
						</label>
						<input
							id="shortDescription"
							v-model="form.shortDescription"
							type="text"
							maxlength="300"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.shortDescriptionPlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.shortDescription?.length || 0 }}/300
						</p>
					</div>

					<!-- Popis -->
					<div class="lg:col-span-2">
						<label
							for="description"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.description') }}
						</label>
						<textarea
							id="description"
							v-model="form.description"
							rows="5"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.descriptionPlaceholder')"
						></textarea>
					</div>
				</div>
			</div>

			<!-- Umístění -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.location') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Kategorie -->
					<div>
						<label
							for="categoryId"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.category') }}
						</label>
						<select
							id="categoryId"
							v-model="form.categoryId"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
						>
							<option value="">{{ t('cms.shops.selectCategory') }}</option>
							<option
								v-for="category in categories"
								:key="category._id"
								:value="category._id"
							>
								{{ category.name }}
							</option>
						</select>
					</div>

					<!-- Patro -->
					<div>
						<label for="floorId" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.floor') }}
						</label>
						<select
							id="floorId"
							v-model="form.floorId"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
						>
							<option value="">{{ t('cms.shops.selectFloor') }}</option>
							<option v-for="floor in floors" :key="floor._id" :value="floor._id">
								{{ floor.name }}
							</option>
						</select>
					</div>

					<!-- Kód jednotky -->
					<div>
						<label for="unitCode" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.units') }}
						</label>
						<select
							id="unitCode"
							v-model="form.unitCode"
							:disabled="!form.floorId"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							<option value="">
								{{
									form.floorId
										? t('cms.shops.selectUnit')
										: t('cms.shops.selectFloorFirst')
								}}
							</option>
							<option
								v-for="unit in availableUnits"
								:key="unit.id"
								:value="unit.id"
								:disabled="unit.isOccupied && unit.id !== form.unitCode"
							>
								{{ unit.id }} - {{ unit.label
								}}{{
									unit.isOccupied && unit.id !== form.unitCode
										? ` (${unit.shopName})`
										: ''
								}}
							</option>
						</select>
						<p class="mt-1 text-xs text-plaza-dark">{{ t('cms.shops.unitHint') }}</p>
					</div>
				</div>
			</div>

			<!-- Kontakt -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.contactInfo') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Telefon -->
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.phone') }}
						</label>
						<input
							id="phone"
							v-model="form.phone"
							type="tel"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							placeholder="+420 123 456 789"
						/>
					</div>

					<!-- Email -->
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.email') }}
						</label>
						<input
							id="email"
							v-model="form.email"
							type="email"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							placeholder="obchod@example.cz"
						/>
					</div>

					<!-- Web -->
					<div>
						<label for="website" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.website') }}
						</label>
						<input
							id="website"
							v-model="form.website"
							type="url"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							placeholder="https://www.example.cz"
						/>
					</div>
				</div>

				<!-- Sociální sítě -->
				<div class="mt-6">
					<h3 class="text-sm font-medium text-gray-700 mb-3">
						{{ t('cms.shops.socialLinks') }}
					</h3>
					<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div>
							<label for="facebook" class="block text-xs text-plaza-dark mb-1"
								>Facebook</label
							>
							<input
								id="facebook"
								v-model="form.socialLinks.facebook"
								type="url"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
								placeholder="https://facebook.com/..."
							/>
						</div>
						<div>
							<label for="instagram" class="block text-xs text-plaza-dark mb-1"
								>Instagram</label
							>
							<input
								id="instagram"
								v-model="form.socialLinks.instagram"
								type="url"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
								placeholder="https://instagram.com/..."
							/>
						</div>
						<div>
							<label for="twitter" class="block text-xs text-plaza-dark mb-1"
								>Twitter / X</label
							>
							<input
								id="twitter"
								v-model="form.socialLinks.twitter"
								type="url"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
								placeholder="https://twitter.com/..."
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Média -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.media') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Logo -->
					<CmsImageUpload
						v-model="form.logo"
						:label="t('cms.shops.logo')"
						:hint="t('cms.shops.logoHint')"
						preview-class="w-24 h-24"
					/>

					<!-- Galerie -->
					<CmsGalleryUpload
						v-model="form.gallery"
						:label="t('cms.shops.gallery')"
						:hint="t('cms.shops.galleryHint')"
					/>
				</div>
			</div>

			<!-- Otevírací doba -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.openingHours') }}
				</h2>

				<div class="space-y-3">
					<div
						v-for="entry in form.openingHours"
						:key="entry.day"
						class="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg"
					>
						<span class="w-24 text-sm font-medium text-gray-700">
							{{ t(`cms.shops.days.${entry.day}`) }}
						</span>

						<label class="inline-flex items-center gap-2">
							<input
								type="checkbox"
								v-model="entry.closed"
								class="w-4 h-4 text-cms-shops-600 rounded focus:ring-cms-shops-500"
							/>
							<span class="text-sm text-gray-600">{{ t('cms.shops.closed') }}</span>
						</label>

						<div v-if="!entry.closed" class="flex items-center gap-2 shrink-0">
							<input
								v-model="entry.open"
								type="time"
								class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
							/>
							<span class="text-gray-400">–</span>
							<input
								v-model="entry.close"
								type="time"
								class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent text-sm"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Speciální otevírací doba -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<div class="flex items-center justify-between mb-6">
					<h2
						class="text-lg font-semibold text-cms-shops-700 border-b border-cms-shops-100 pb-2 flex-1"
					>
						{{ t('cms.shops.specialOpeningHours') }}
					</h2>
					<button
						type="button"
						@click="addSpecialOpeningHours"
						class="ml-4 px-3 py-1.5 text-sm bg-cms-shops-100 text-cms-shops-700 rounded-lg hover:bg-cms-shops-200 transition-colors"
					>
						+ {{ t('cms.shops.addSpecialHours') }}
					</button>
				</div>

				<div
					v-if="form.specialOpeningHours.length === 0"
					class="text-center py-6 text-plaza-dark"
				>
					{{ t('cms.shops.noSpecialHours') }}
				</div>

				<div v-else class="space-y-4">
					<div
						v-for="(entry, index) in form.specialOpeningHours"
						:key="index"
						class="p-4 bg-gray-50 rounded-lg border border-gray-200"
					>
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-center gap-4">
								<!-- Typ: den nebo období -->
								<select
									v-model="entry.type"
									class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
								>
									<option value="single">{{ t('cms.shops.singleDay') }}</option>
									<option value="range">{{ t('cms.shops.dateRange') }}</option>
								</select>
							</div>
							<button
								type="button"
								@click="removeSpecialOpeningHours(index)"
								class="text-red-500 hover:text-red-700 p-1"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
							<!-- Jednotlivý den -->
							<div v-if="entry.type === 'single'">
								<label class="block text-xs text-plaza-dark mb-1">{{
									t('cms.shops.date')
								}}</label>
								<input
									v-model="entry.date"
									type="date"
									class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
								/>
							</div>

							<!-- Období od-do -->
							<template v-else>
								<div>
									<label class="block text-xs text-plaza-dark mb-1">{{
										t('cms.shops.dateFrom')
									}}</label>
									<input
										v-model="entry.dateFrom"
										type="date"
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
									/>
								</div>
								<div>
									<label class="block text-xs text-plaza-dark mb-1">{{
										t('cms.shops.dateTo')
									}}</label>
									<input
										v-model="entry.dateTo"
										type="date"
										class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
									/>
								</div>
							</template>

							<!-- Zavřeno checkbox -->
							<div class="flex items-end pb-1">
								<label class="inline-flex items-center gap-2">
									<input
										type="checkbox"
										v-model="entry.closed"
										class="w-4 h-4 text-cms-shops-600 rounded focus:ring-cms-shops-500"
									/>
									<span class="text-sm text-gray-600">{{
										t('cms.shops.closed')
									}}</span>
								</label>
							</div>

							<!-- Otevírací hodiny (pokud není zavřeno) -->
							<template v-if="!entry.closed">
								<div class="flex items-end gap-2">
									<div>
										<label class="block text-xs text-plaza-dark mb-1">{{
											t('cms.shops.openTime')
										}}</label>
										<input
											v-model="entry.open"
											type="time"
											class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
										/>
									</div>
									<span class="pb-1.5 text-gray-400">–</span>
									<div>
										<label class="block text-xs text-plaza-dark mb-1">{{
											t('cms.shops.closeTime')
										}}</label>
										<input
											v-model="entry.close"
											type="time"
											class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
										/>
									</div>
								</div>
							</template>
						</div>

						<!-- Poznámka -->
						<div class="mt-3">
							<label class="block text-xs text-plaza-dark mb-1">{{
								t('cms.shops.specialNote')
							}}</label>
							<input
								v-model="entry.note"
								type="text"
								maxlength="200"
								class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cms-shops-500"
								:placeholder="t('cms.shops.specialNotePlaceholder')"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- SEO -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.seo') }}
				</h2>

				<div class="space-y-6">
					<div>
						<label for="seoTitle" class="block text-sm font-medium text-gray-700 mb-1">
							{{ t('cms.shops.seoTitle') }}
						</label>
						<input
							id="seoTitle"
							v-model="form.seoTitle"
							type="text"
							maxlength="60"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.seoTitlePlaceholder')"
						/>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.seoTitle?.length || 0 }}/60
						</p>
					</div>

					<div>
						<label
							for="seoDescription"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.seoDescription') }}
						</label>
						<textarea
							id="seoDescription"
							v-model="form.seoDescription"
							rows="2"
							maxlength="160"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent"
							:placeholder="t('cms.shops.seoDescriptionPlaceholder')"
						></textarea>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ form.seoDescription?.length || 0 }}/160
						</p>
					</div>
				</div>
			</div>

			<!-- Nastavení -->
			<div class="bg-white rounded-xl shadow-sm p-6">
				<h2
					class="text-lg font-semibold mb-6 text-cms-shops-700 border-b border-cms-shops-100 pb-2"
				>
					{{ t('cms.shops.settings') }}
				</h2>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Je aktivní -->
					<div class="flex items-center">
						<label class="inline-flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								v-model="form.isActive"
								class="w-4 h-4 text-cms-shops-600 rounded focus:ring-cms-shops-500"
							/>
							<span class="text-sm font-medium text-gray-700">{{
								t('cms.shops.isActive')
							}}</span>
						</label>
					</div>

					<!-- Datum zveřejnění -->
					<div>
						<label
							for="publishDate"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							{{ t('cms.shops.publishDate') }}
						</label>
						<div class="relative">
							<input
								id="publishDate"
								v-model="form.publishDate"
								type="date"
								class="peer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cms-shops-500 focus:border-transparent focus:text-gray-900"
								:class="{ 'text-transparent': !form.publishDate }"
							/>
							<span
								v-if="!form.publishDate"
								class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none peer-focus:hidden"
							>
								{{ t('cms.shops.publishDateEmpty') }}
							</span>
						</div>
						<p class="mt-1 text-xs text-plaza-dark">
							{{ t('cms.shops.publishDateHint') }}
						</p>
						<button
							v-if="form.publishDate"
							type="button"
							@click="form.publishDate = ''"
							class="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 transition-colors"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							{{ t('cms.shops.clearPublishDate') }}
						</button>
					</div>
				</div>

				<!-- Metadata -->
				<div class="mt-6 pt-4 border-t border-gray-200 text-sm text-plaza-dark">
					<p>{{ t('cms.shops.createdAt') }}: {{ formatDate(shop.createdAt) }}</p>
					<p>{{ t('cms.shops.updatedAt') }}: {{ formatDate(shop.updatedAt) }}</p>
				</div>
			</div>

			<!-- Buttons -->
			<div class="flex justify-between gap-3 pt-4">
				<button
					type="button"
					@click="confirmDelete"
					class="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
				>
					{{ t('common.delete') }}
				</button>
				<div class="flex gap-3">
					<NuxtLink
						to="/cms/obchody"
						class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						{{ t('common.cancel') }}
					</NuxtLink>
					<button
						type="submit"
						:disabled="submitting"
						class="px-6 py-2 bg-cms-shops-600 text-white rounded-lg hover:bg-cms-shops-700 transition-colors disabled:opacity-50"
					>
						{{ submitting ? t('common.loading') : t('common.save') }}
					</button>
				</div>
			</div>
		</form>

		<!-- Delete confirmation modal -->
		<Teleport to="body">
			<div
				v-if="showDeleteModal"
				class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
				@click.self="showDeleteModal = false"
			>
				<div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
					<h3 class="text-lg font-semibold mb-2">
						{{ t('cms.shops.deleteConfirmTitle') }}
					</h3>
					<p class="text-gray-600 mb-6">
						{{ t('cms.shops.deleteConfirmMessage', { name: shop?.name }) }}
					</p>
					<div class="flex justify-end gap-3">
						<button
							@click="showDeleteModal = false"
							class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							{{ t('common.cancel') }}
						</button>
						<button
							@click="deleteShop"
							:disabled="deleting"
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
						>
							{{ deleting ? t('common.loading') : t('common.delete') }}
						</button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import type { Shop, Floor, DayOfWeek, OpeningHoursEntry, Category } from '~~/shared/types'
import { getUnitsForFloor } from '~~/shared/map/units'

definePageMeta({
	layout: 'cms',
	middleware: 'cms',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { secureFetch } = useCmsAuth()

const shopId = route.params.id as string

// Days of week
const daysOfWeek: DayOfWeek[] = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
]

// Fetch shop data
const {
	data: shop,
	pending,
	error: fetchError,
	refresh: _refresh,
} = await useFetch<Shop>(`/api/shops/${shopId}`)

// Dynamic SEO title
const seoTitle = computed(() =>
	shop.value?.name ? `${t('cms.shops.editShop')}: ${shop.value.name}` : t('cms.shops.editShop'),
)
watchEffect(() => {
	usePlazaSeo({
		title: seoTitle.value,
		noIndex: true,
	})
})

// Form state - initialized from shop data
interface OpeningHoursFormEntry {
	day: DayOfWeek
	open: string
	close: string
	closed: boolean
}

interface SpecialOpeningHoursFormEntry {
	type: 'single' | 'range'
	date: string
	dateFrom: string
	dateTo: string
	open: string
	close: string
	closed: boolean
	note: string
}

const form = reactive({
	name: '',
	slug: '',
	description: '',
	shortDescription: '',
	logo: '',
	gallery: [] as string[],
	phone: '',
	email: '',
	website: '',
	socialLinks: {
		facebook: '',
		instagram: '',
		twitter: '',
	},
	floorId: '',
	categoryId: '',
	unitCode: '',
	openingHours: [] as OpeningHoursFormEntry[],
	specialOpeningHours: [] as SpecialOpeningHoursFormEntry[],
	isActive: true,
	publishDate: '',
	seoTitle: '',
	seoDescription: '',
})

// Speciální otevírací doba - pomocné funkce
const addSpecialOpeningHours = () => {
	form.specialOpeningHours.push({
		type: 'single',
		date: '',
		dateFrom: '',
		dateTo: '',
		open: '09:00',
		close: '21:00',
		closed: false,
		note: '',
	})
}

const removeSpecialOpeningHours = (index: number) => {
	form.specialOpeningHours.splice(index, 1)
}

// Initialize form when shop data is loaded
watch(
	shop,
	(newShop) => {
		if (newShop) {
			form.name = newShop.name || ''
			form.slug = newShop.slug || ''
			form.description = newShop.description || ''
			form.shortDescription = newShop.shortDescription || ''
			form.logo = newShop.logo || ''
			form.gallery = newShop.gallery || []
			form.phone = newShop.phone || ''
			form.email = newShop.email || ''
			form.website = newShop.website || ''
			form.socialLinks.facebook = newShop.socialLinks?.facebook || ''
			form.socialLinks.instagram = newShop.socialLinks?.instagram || ''
			form.socialLinks.twitter = newShop.socialLinks?.twitter || ''
			// floorId může být string nebo populovaný objekt
			form.floorId =
				typeof newShop.floorId === 'object' && newShop.floorId?._id
					? newShop.floorId._id
					: newShop.floorId || ''
			// categoryId může být string nebo populovaný objekt
			form.categoryId =
				typeof newShop.categoryId === 'object' && newShop.categoryId?._id
					? newShop.categoryId._id
					: newShop.categoryId || ''
			form.unitCode = newShop.unitCode || ''
			form.isActive = newShop.isActive ?? true
			form.publishDate = newShop.publishDate
				? new Date(newShop.publishDate).toISOString().split('T')[0]
				: ''
			form.seoTitle = newShop.seoTitle || ''
			form.seoDescription = newShop.seoDescription || ''

			// Initialize opening hours - merge with defaults
			const existingHours = new Map(
				(newShop.openingHours || []).map((h: OpeningHoursEntry) => [h.day, h]),
			)
			form.openingHours = daysOfWeek.map((day) => {
				const existing = existingHours.get(day) as OpeningHoursEntry | undefined
				return {
					day,
					open: existing?.open || '09:00',
					close: existing?.close || '21:00',
					closed: existing?.closed ?? !existing,
				}
			})

			// Initialize special opening hours
			form.specialOpeningHours = (newShop.specialOpeningHours || []).map((entry) => {
				// Convert ISO date strings to YYYY-MM-DD format for date inputs
				const formatDate = (dateStr: string | undefined) => {
					if (!dateStr) return ''
					const d = new Date(dateStr)
					if (isNaN(d.getTime())) return ''
					return d.toISOString().split('T')[0]
				}
				return {
					type: entry.dateFrom && entry.dateTo ? ('range' as const) : ('single' as const),
					date: formatDate(entry.date),
					dateFrom: formatDate(entry.dateFrom),
					dateTo: formatDate(entry.dateTo),
					open: entry.open || '09:00',
					close: entry.close || '21:00',
					closed: entry.closed ?? false,
					note: entry.note || '',
				}
			})
		}
	},
	{ immediate: true },
)

const submitting = ref(false)
const flash = useFlashMessages()
const {
	errors,
	generalError,
	clearErrors,
	handleApiError,
	hasError: _hasError,
	getError: _getError,
	scrollToFirstError,
} = useFormErrors()

// Fetch floors
const { data: floorsData } = await useFetch<{ data: Floor[] }>('/api/floors', {
	query: { limit: 100 },
})
const floors = computed(() => floorsData.value?.data || [])

// Fetch categories
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/categories', {
	query: { limit: 100 },
})
const categories = computed(() => categoriesData.value?.data || [])

// Fetch map units with occupancy
const { data: mapData, refresh: _refreshMapData } = await useFetch<{
	floors: Array<{
		level: number
		units: Array<{ id: string; shop: { _id: string; name: string } | null }>
	}>
}>('/api/map/units')

// Computed: available units for selected floor
const availableUnits = computed(() => {
	if (!form.floorId) return []

	// Find selected floor to get its level
	const selectedFloor = floors.value.find((f) => f._id === form.floorId)
	if (!selectedFloor) return []

	const floorLevel = selectedFloor.level

	// Get units for this floor level
	const units = getUnitsForFloor(floorLevel)

	// Get occupancy data
	const floorData = mapData.value?.floors?.find((f) => f.level === floorLevel)

	return units.map((unit) => {
		const unitData = floorData?.units?.find((u) => u.id === unit.id)
		const isOccupied = !!unitData?.shop
		return {
			...unit,
			isOccupied,
			shopName: unitData?.shop?.name || '',
		}
	})
})

// Store previous floorId to detect changes
const previousFloorId = ref(form.floorId)

// Clear unitCode only when floor actually changes (not on initial load)
watch(
	() => form.floorId,
	(newFloorId, oldFloorId) => {
		if (previousFloorId.value && newFloorId !== oldFloorId) {
			form.unitCode = ''
		}
		previousFloorId.value = newFloorId
	},
)

const handleSubmit = async () => {
	clearErrors()

	// Validate
	if (!form.name.trim()) {
		errors.value.name = t('forms.required')
		scrollToFirstError()
		return
	}

	submitting.value = true

	try {
		// Prepare data
		const data: Record<string, unknown> = {
			name: form.name.trim(),
			slug: form.slug.trim() || undefined,
			description: form.description.trim() || undefined,
			shortDescription: form.shortDescription.trim() || undefined,
			logo: form.logo.trim() || '',
			gallery: form.gallery,
			phone: form.phone.trim() || undefined,
			email: form.email.trim() || undefined,
			website: form.website.trim() || undefined,
			floorId: form.floorId || null,
			categoryId: form.categoryId || null,
			unitCode: form.unitCode.trim() || null,
			isActive: form.isActive,
			publishDate: form.publishDate ? new Date(form.publishDate).toISOString() : null,
			seoTitle: form.seoTitle.trim() || undefined,
			seoDescription: form.seoDescription.trim() || undefined,
		}

		// Social links
		const socialLinks: Record<string, string> = {}
		if (form.socialLinks.facebook) socialLinks.facebook = form.socialLinks.facebook.trim()
		if (form.socialLinks.instagram) socialLinks.instagram = form.socialLinks.instagram.trim()
		if (form.socialLinks.twitter) socialLinks.twitter = form.socialLinks.twitter.trim()
		if (Object.keys(socialLinks).length) {
			data.socialLinks = socialLinks
		}

		// Opening hours
		const openingHours = form.openingHours
			.filter((entry) => !entry.closed && entry.open && entry.close)
			.map((entry) => ({
				day: entry.day,
				open: entry.open,
				close: entry.close,
				closed: false,
			}))
		if (openingHours.length) {
			data.openingHours = openingHours
		}

		// Special opening hours
		const specialOpeningHours = form.specialOpeningHours
			.filter((entry) =>
				entry.type === 'single' ? entry.date : entry.dateFrom && entry.dateTo,
			)
			.map((entry) => ({
				date: entry.type === 'single' ? entry.date : undefined,
				dateFrom: entry.type === 'range' ? entry.dateFrom : undefined,
				dateTo: entry.type === 'range' ? entry.dateTo : undefined,
				open: entry.closed ? undefined : entry.open,
				close: entry.closed ? undefined : entry.close,
				closed: entry.closed,
				note: entry.note || undefined,
			}))
		if (specialOpeningHours.length) {
			data.specialOpeningHours = specialOpeningHours
		}

		await secureFetch(`/api/shops/${shopId}`, {
			method: 'PUT',
			body: data,
		})

		// Flash message a redirect
		flash.success(t('cms.flash.shopUpdated'))
		router.push('/cms/obchody')
	} catch (e) {
		const errorMessage = handleApiError(e)
		flash.error(errorMessage || t('cms.flash.shopSaveError'))
		scrollToFirstError()
	} finally {
		submitting.value = false
	}
}

// Delete shop
const showDeleteModal = ref(false)
const deleting = ref(false)

const confirmDelete = () => {
	showDeleteModal.value = true
}

const deleteShop = async () => {
	deleting.value = true
	try {
		await secureFetch(`/api/shops/${shopId}`, {
			method: 'DELETE',
		})
		flash.success(t('cms.flash.shopDeleted'))
		router.push('/cms/obchody')
	} catch (e) {
		flash.error(t('cms.flash.errorOccurred'))
		console.error('Failed to delete shop:', e)
	} finally {
		deleting.value = false
	}
}

// Format date helper
const formatDate = (dateStr: string) => {
	return new Date(dateStr).toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
</script>
