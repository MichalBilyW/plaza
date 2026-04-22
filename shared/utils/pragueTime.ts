export const PRAGUE_TIME_ZONE = 'Europe/Prague'

const WEEKDAY_INDEX: Record<string, number> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6,
}

const pragueDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: PRAGUE_TIME_ZONE,
	weekday: 'short',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
})

function padDatePart(value: number) {
	return String(value).padStart(2, '0')
}

function normalizeDate(input: Date | number) {
	return input instanceof Date ? input : new Date(input)
}

function partsRecord(date: Date) {
	return Object.fromEntries(
		pragueDateTimeFormatter.formatToParts(date).map((part) => [part.type, part.value]),
	)
}

export function getPragueDateParts(input: Date | number = Date.now()) {
	const parts = partsRecord(normalizeDate(input))
	const year = Number(parts.year)
	const month = Number(parts.month)
	const day = Number(parts.day)
	const hour = Number(parts.hour)
	const minute = Number(parts.minute)

	return {
		year,
		month,
		day,
		hour,
		minute,
		weekdayIndex: WEEKDAY_INDEX[parts.weekday ?? ''] ?? 0,
		dateKey: `${year}-${padDatePart(month)}-${padDatePart(day)}`,
	}
}

export function getPragueDateKey(input: Date | string | number) {
	if (typeof input === 'string') {
		const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input)
		if (dateOnlyMatch) return input
	}

	return getPragueDateParts(
		input instanceof Date || typeof input === 'number' ? input : new Date(input),
	).dateKey
}
