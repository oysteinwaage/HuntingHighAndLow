export const MIN_HUNTING_YEAR = 2026

export function getCurrentHuntingYear() {
  return new Date().getFullYear()
}

export function getMaxHuntingYear() {
  return getCurrentHuntingYear() + 1
}

export function clampHuntingYear(year) {
  return Math.min(getMaxHuntingYear(), Math.max(MIN_HUNTING_YEAR, year))
}

// Selectable years, newest first: from next year down to MIN_HUNTING_YEAR.
export function getYearOptions() {
  const years = []
  for (let y = getMaxHuntingYear(); y >= MIN_HUNTING_YEAR; y--) {
    years.push(y)
  }
  return years
}
