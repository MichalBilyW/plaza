/**
 * Composable pro globální modal s obsahem služby
 */

import type { Service } from '@/shared/types'

const isModalOpen = ref(false)
const selectedService = ref<Service | null>(null)

export const useServiceModal = () => {
	const openModal = (service: Service) => {
		selectedService.value = service
		isModalOpen.value = true
	}

	const closeModal = () => {
		isModalOpen.value = false
		selectedService.value = null
	}

	return {
		isModalOpen: readonly(isModalOpen),
		selectedService: readonly(selectedService),
		openModal,
		closeModal,
	}
}
