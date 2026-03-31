/**
 * Composable pro globální modal s obsahem služby
 */

import type { Service } from '@/shared/types'

const isModalOpen = ref(false)
const selectedService = ref<Service | null>(null)

export const useServiceModal = () => {
	const { trackModalOpen } = useDataLayer()

	const openModal = (service: Service) => {
		selectedService.value = service
		isModalOpen.value = true
		trackModalOpen('service', service.shortDescription)
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
