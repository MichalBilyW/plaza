/**
 * Composable pro globální modal s důležitými kontakty
 */

const isModalOpen = ref(false)

export const useContactsModal = () => {
	const { trackModalOpen } = useDataLayer()

	const openModal = () => {
		isModalOpen.value = true
		trackModalOpen('contacts')
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
