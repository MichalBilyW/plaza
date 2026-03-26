/**
 * Composable pro globální modal s otevírací dobou
 */

const isModalOpen = ref(false)

export const useOpeningHoursModal = () => {
	const openModal = () => {
		isModalOpen.value = true
	}

	const closeModal = () => {
		isModalOpen.value = false
	}

	const toggleModal = () => {
		isModalOpen.value = !isModalOpen.value
	}

	return {
		isModalOpen: readonly(isModalOpen),
		openModal,
		closeModal,
		toggleModal,
	}
}
