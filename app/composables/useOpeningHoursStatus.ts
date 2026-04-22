import type { DayOfWeek, OpeningHoursEntry, SpecialOpeningHours } from '@/shared/types'
import { getPragueDateKey, getPragueDateParts } from '#shared/utils/pragueTime'

const DAY_MAPPING: DayOfWeek[] = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
]

const DAY_LABELS = {
	short: {
		monday: 'Po',
		tuesday: 'Út',
		wednesday: 'St',
		thursday: 'Čt',
		friday: 'Pá',
		saturday: 'So',
		sunday: 'Ne',
	},
	full: {
		monday: 'Pondělí',
		tuesday: 'Úterý',
		wednesday: 'Středa',
		thursday: 'Čtvrtek',
		friday: 'Pátek',
		saturday: 'Sobota',
		sunday: 'Neděle',
	},
} satisfies Record<'short' | 'full', Record<DayOfWeek, string>>

interface ResolvedOpeningHours {
	day: DayOfWeek
	dayLabel: string
	open: string
	close: string
	closed: boolean
	note?: string
	isSpecial: boolean
}

interface UseOpeningHoursStatusOptions {
	dayLabelFormat?: 'short' | 'full'
	fallbackOpen?: string
	fallbackClose?: string
}

type OpeningHoursGetter = () => OpeningHoursEntry[] | null | undefined
type SpecialOpeningHoursGetter = () => SpecialOpeningHours[] | null | undefined

function parseTimeMinutes(time: string) {
	const [hours = '0', minutes = '0'] = time.split(':')
	return Number(hours) * 60 + Number(minutes)
}

function isTimeInRange(currentMinutes: number, open: string, close: string) {
	const openMinutes = parseTimeMinutes(open)
	const closeMinutes = parseTimeMinutes(close)

	if (closeMinutes <= openMinutes) {
		return currentMinutes >= openMinutes || currentMinutes < closeMinutes
	}

	return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

function isSpecialHoursActiveForDate(entry: SpecialOpeningHours, date: Date) {
	const currentDateKey = getPragueDateKey(date)

	if (entry.date) {
		return getPragueDateKey(entry.date) === currentDateKey
	}

	if (entry.dateFrom && entry.dateTo) {
		return (
			currentDateKey >= getPragueDateKey(entry.dateFrom) &&
			currentDateKey <= getPragueDateKey(entry.dateTo)
		)
	}

	return false
}

function isSpecialHoursCurrentOrFutureForDate(entry: SpecialOpeningHours, date: Date) {
	const currentDateKey = getPragueDateKey(date)

	if (entry.date) {
		return getPragueDateKey(entry.date) >= currentDateKey
	}

	if (entry.dateTo) {
		return getPragueDateKey(entry.dateTo) >= currentDateKey
	}

	if (entry.dateFrom) {
		return getPragueDateKey(entry.dateFrom) >= currentDateKey
	}

	return false
}

export function useOpeningHoursStatus(
	getOpeningHours: OpeningHoursGetter,
	getSpecialOpeningHours: SpecialOpeningHoursGetter = () => null,
	options: UseOpeningHoursStatusOptions = {},
) {
	const currentTimestamp = useState<number>('opening-hours-current-timestamp', () => Date.now())
	let currentTimeInterval: ReturnType<typeof setInterval> | null = null

	const dayLabelFormat = options.dayLabelFormat ?? 'full'
	const fallbackOpen = options.fallbackOpen ?? '09:00'
	const fallbackClose = options.fallbackClose ?? '21:00'

	const currentDate = computed(() => new Date(currentTimestamp.value))
	const currentPragueDateParts = computed(() => getPragueDateParts(currentTimestamp.value))
	const currentDay = computed(
		() => DAY_MAPPING[currentPragueDateParts.value.weekdayIndex] as DayOfWeek,
	)

	function getDayLabel(day: DayOfWeek, format: 'short' | 'full' = dayLabelFormat) {
		return DAY_LABELS[format][day]
	}

	function isToday(day: DayOfWeek) {
		return currentDay.value === day
	}

	function isSpecialHoursActive(entry: SpecialOpeningHours) {
		return isSpecialHoursActiveForDate(entry, currentDate.value)
	}

	function isSpecialHoursCurrentOrFuture(entry: SpecialOpeningHours) {
		return isSpecialHoursCurrentOrFutureForDate(entry, currentDate.value)
	}

	const todaySpecialHours = computed<SpecialOpeningHours | null>(() => {
		const specialOpeningHours = getSpecialOpeningHours()
		if (!specialOpeningHours?.length) return null

		return (
			specialOpeningHours.find((entry) =>
				isSpecialHoursActiveForDate(entry, currentDate.value),
			) ?? null
		)
	})

	const todayOpeningHours = computed<ResolvedOpeningHours | null>(() => {
		const day = currentDay.value
		const special = todaySpecialHours.value

		if (special) {
			return {
				day,
				dayLabel: getDayLabel(day),
				open: special.open ?? fallbackOpen,
				close: special.close ?? fallbackClose,
				closed: special.closed ?? false,
				note: special.note,
				isSpecial: true,
			}
		}

		const hours = getOpeningHours()?.find((entry) => entry.day === day)
		if (!hours) return null

		return {
			day,
			dayLabel: getDayLabel(day),
			open: hours.open,
			close: hours.close,
			closed: hours.closed ?? false,
			isSpecial: false,
		}
	})

	const isOpen = computed(() => {
		const hours = todayOpeningHours.value
		if (!hours || hours.closed) return false
		const currentMinutes =
			currentPragueDateParts.value.hour * 60 + currentPragueDateParts.value.minute
		return isTimeInRange(currentMinutes, hours.open, hours.close)
	})

	const specialNote = computed(() => todayOpeningHours.value?.note ?? null)

	onMounted(() => {
		currentTimestamp.value = Date.now()
		currentTimeInterval = setInterval(() => {
			currentTimestamp.value = Date.now()
		}, 30_000)
	})

	onUnmounted(() => {
		if (currentTimeInterval) clearInterval(currentTimeInterval)
	})

	return {
		currentDate,
		currentDay,
		todaySpecialHours,
		todayOpeningHours,
		isOpen,
		specialNote,
		getDayLabel,
		isToday,
		isSpecialHoursActive,
		isSpecialHoursCurrentOrFuture,
	}
}
