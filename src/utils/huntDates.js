const SEASON_OPEN_MONTH = 8 // September (0-indexed)
const SEASON_OPEN_DAY = 10
const FRIDAY = 5

// Default hunt is Thursday–Sunday around the first Friday+Saturday that both
// fall on or after the season opening date (10 September).
export function getDefaultHuntDates(year) {
  const friday = new Date(year, SEASON_OPEN_MONTH, SEASON_OPEN_DAY)
  while (friday.getDay() !== FRIDAY) {
    friday.setDate(friday.getDate() + 1)
  }

  const start = new Date(friday)
  start.setDate(friday.getDate() - 1) // Thursday

  const end = new Date(friday)
  end.setDate(friday.getDate() + 2) // Sunday

  return { start, end }
}

export function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateString(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isPast(date, referenceDate = new Date()) {
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return referenceDate > endOfDay
}

const SHORT_MONTH_NAMES = [
  'jan',
  'feb',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'aug',
  'sept',
  'okt',
  'nov',
  'des',
]

export function formatDateRange(start, end) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const monthName = (date) => SHORT_MONTH_NAMES[date.getMonth()]

  if (sameMonth) {
    return `${start.getDate()}.–${end.getDate()}. ${monthName(end)} ${end.getFullYear()}`
  }
  return `${start.getDate()}. ${monthName(start)} – ${end.getDate()}. ${monthName(end)} ${end.getFullYear()}`
}
