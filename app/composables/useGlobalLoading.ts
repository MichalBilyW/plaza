export const useGlobalLoading = () => {
	const requestCount = useState<number>('global-loading-request-count', () => 0)
	const routeCount = useState<number>('global-loading-route-count', () => 0)

	const startRequest = () => {
		requestCount.value += 1
	}

	const finishRequest = () => {
		requestCount.value = Math.max(0, requestCount.value - 1)
	}

	const startRoute = () => {
		routeCount.value += 1
	}

	const finishRoute = () => {
		routeCount.value = Math.max(0, routeCount.value - 1)
	}

	const reset = () => {
		requestCount.value = 0
		routeCount.value = 0
	}

	const isLoading = computed(() => requestCount.value > 0 || routeCount.value > 0)

	return {
		isLoading,
		startRequest,
		finishRequest,
		startRoute,
		finishRoute,
		reset,
	}
}