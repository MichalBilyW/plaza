export default defineNuxtPlugin((nuxtApp) => {
	const { startRequest, finishRequest, startRoute, finishRoute, reset } = useGlobalLoading()

	nuxtApp.hook('page:start', () => {
		startRoute()
	})

	nuxtApp.hook('page:finish', () => {
		finishRoute()
	})

	nuxtApp.hook('app:error', () => {
		reset()
	})

	const globalScope = globalThis as typeof globalThis & {
		__plazaLoaderFetchInstalled__?: boolean
	}

	if (globalScope.__plazaLoaderFetchInstalled__) {
		return
	}

	const originalFetch = globalThis.fetch.bind(globalThis)
	globalScope.__plazaLoaderFetchInstalled__ = true

	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		startRequest()
		try {
			return await originalFetch(input, init)
		} finally {
			finishRequest()
		}
	}) as typeof fetch
})