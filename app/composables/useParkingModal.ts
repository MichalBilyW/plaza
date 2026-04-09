/**
 * Composable pro globální modal s parkováním
 */

const isModalOpen = ref(false)

export const useParkingModal = () => {
	const { trackModalOpen } = useDataLayer()

	const openModal = () => {
		isModalOpen.value = true
		trackModalOpen('parking')
	}

	const closeModal = () => {
		isModalOpen.value = false
	}

	return {
		isModalOpen: readonly(isModalOpen),
		openModal,
		closeModal,
	}
}
