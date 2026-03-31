/**
 * Composable pro globální modal s otevírací dobou
 */

const isModalOpen = ref(false)

export const useOpeningHoursModal = () => {
	const { trackModalOpen } = useDataLayer()

	const openModal = () => {
		isModalOpen.value = true
		trackModalOpen('opening_hours')
	}

	const closeModal = () => {
		isModalOpen.value = false
	}

	const toggleModal = () => {
		if (!isModalOpen.value) {
			trackModalOpen('opening_hours')
		}
		isModalOpen.value = !isModalOpen.value
	}

	return {
		isModalOpen: readonly(isModalOpen),
		openModal,
		closeModal,
		toggleModal,
	}
}
