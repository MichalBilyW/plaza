/**
 * Composable pro globální modal s obsahem akce
 */

import type { Event } from '@/shared/types'

const isModalOpen = ref(false)
const selectedEvent = ref<Event | null>(null)

export const useEventModal = () => {
	const { trackEventClick, trackModalOpen } = useDataLayer()

	const openModal = (event: Event) => {
		selectedEvent.value = event
		isModalOpen.value = true
		// Track event click and modal open
		trackEventClick({ name: event.name, date: null })
		trackModalOpen('event', event.name)
	}

	const closeModal = () => {
		isModalOpen.value = false
		selectedEvent.value = null
	}

	return {
		isModalOpen: readonly(isModalOpen),
		selectedEvent: readonly(selectedEvent),
		openModal,
		closeModal,
	}
}
