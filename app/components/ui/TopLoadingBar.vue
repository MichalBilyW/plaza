<template>
	<Transition name="top-loading-bar-fade">
		<div v-show="visible" class="top-loading-bar" aria-hidden="true">
			<div class="top-loading-bar__fill" :style="{ transform: `scaleX(${progress / 100})` }"></div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
const { isLoading } = useGlobalLoading()

const visible = ref(false)
const progress = ref(0)

let progressTimer: ReturnType<typeof window.setInterval> | null = null
let hideTimer: ReturnType<typeof window.setTimeout> | null = null

const clearProgressTimer = () => {
	if (progressTimer !== null) {
		window.clearInterval(progressTimer)
		progressTimer = null
	}
}

const clearHideTimer = () => {
	if (hideTimer !== null) {
		window.clearTimeout(hideTimer)
		hideTimer = null
	}
}

const startProgress = () => {
	clearProgressTimer()
	progressTimer = window.setInterval(() => {
		progress.value = Math.min(progress.value + Math.max(1, (100 - progress.value) * 0.08), 92)
	}, 160)
}

watch(
	isLoading,
	(loading) => {
		if (import.meta.server) return

		clearHideTimer()

		if (loading) {
			visible.value = true
			progress.value = progress.value > 0 ? Math.min(progress.value, 25) : 6
			startProgress()
			return
		}

		clearProgressTimer()

		if (!visible.value) {
			progress.value = 0
			return
		}

		progress.value = 100
		hideTimer = window.setTimeout(() => {
			visible.value = false
			progress.value = 0
		}, 220)
	},
	{ immediate: true },
)

onBeforeUnmount(() => {
	clearProgressTimer()
	clearHideTimer()
})
</script>

<style scoped>
.top-loading-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
	z-index: 10000;
	pointer-events: none;
	overflow: hidden;
	background: rgba(226, 11, 27, 0.12);
}

.top-loading-bar__fill {
	height: 100%;
	width: 100%;
	transform-origin: left center;
	transition: transform 0.18s ease-out;
	background: linear-gradient(90deg, #e20b1b 0%, #ff7a45 100%);
	box-shadow: 0 0 12px rgba(226, 11, 27, 0.4);
}

.top-loading-bar-fade-enter-active,
.top-loading-bar-fade-leave-active {
	transition: opacity 0.18s ease;
}

.top-loading-bar-fade-enter-from,
.top-loading-bar-fade-leave-to {
	opacity: 0;
}
</style>