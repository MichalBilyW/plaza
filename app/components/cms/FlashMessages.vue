<template>
	<ClientOnly>
		<Teleport to="body">
			<div
				v-if="messages.length > 0"
				class="fixed bottom-12 right-12 z-[100] pointer-events-none"
				aria-live="polite"
			>
				<div class="max-w-4xl mx-auto p-4 space-y-2 lg:ml-64">
					<TransitionGroup name="flash" tag="div" class="space-y-2">
						<div
							v-for="msg in messages"
							:key="msg.id"
							:class="[
								'pointer-events-auto rounded-lg shadow-lg p-4 flex items-start gap-3 border',
								typeClasses[msg.type],
							]"
						>
							<!-- Ikona -->
							<div :class="['flex-shrink-0', iconClasses[msg.type]]">
								<!-- Success -->
								<svg
									v-if="msg.type === 'success'"
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<!-- Error -->
								<svg
									v-else-if="msg.type === 'error'"
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<!-- Warning -->
								<svg
									v-else-if="msg.type === 'warning'"
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<!-- Info -->
								<svg
									v-else
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>

							<!-- Text -->
							<p class="flex-1 text-sm font-medium">{{ msg.message }}</p>

							<!-- Zavřít -->
							<button
								type="button"
								@click="removeMessage(msg.id)"
								:class="[
									'flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors',
									closeClasses[msg.type],
								]"
								:aria-label="$t('common.close')"
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
							</button>
						</div>
					</TransitionGroup>
				</div>
			</div>
		</Teleport>
	</ClientOnly>
</template>

<script setup lang="ts">
const { messages, removeMessage } = useFlashMessages()

const typeClasses: Record<string, string> = {
	success: 'bg-green-50 border-green-200 text-green-800',
	error: 'bg-red-50 border-red-200 text-red-800',
	warning: 'bg-amber-50 border-amber-200 text-amber-800',
	info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconClasses: Record<string, string> = {
	success: 'text-green-500',
	error: 'text-red-500',
	warning: 'text-amber-500',
	info: 'text-blue-500',
}

const closeClasses: Record<string, string> = {
	success: 'text-green-600 hover:text-green-800',
	error: 'text-red-600 hover:text-red-800',
	warning: 'text-amber-600 hover:text-amber-800',
	info: 'text-blue-600 hover:text-blue-800',
}
</script>

<style scoped>
.flash-enter-active {
	transition: all 0.3s ease-out;
}

.flash-leave-active {
	transition: all 0.2s ease-in;
}

.flash-enter-from {
	opacity: 0;
	transform: translateY(-20px);
}

.flash-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

.flash-move {
	transition: transform 0.3s ease;
}
</style>
