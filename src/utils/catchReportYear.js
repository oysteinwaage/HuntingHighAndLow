import { SEASON_OPEN_DAY, SEASON_OPEN_MONTH } from './huntDates'

export const MIN_CATCH_REPORT_YEAR = 2003

// The current year only becomes selectable once the season has opened
// (10. september) — before that, the max selectable year is last year.
export function getMaxCatchReportYear(referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const seasonOpen = new Date(year, SEASON_OPEN_MONTH, SEASON_OPEN_DAY)
  return referenceDate >= seasonOpen ? year : year - 1
}

// Selectable years, newest first: from the max selectable year down to MIN_CATCH_REPORT_YEAR.
export function getCatchReportYearOptions(referenceDate = new Date()) {
  const years = []
  for (let y = getMaxCatchReportYear(referenceDate); y >= MIN_CATCH_REPORT_YEAR; y--) {
    years.push(y)
  }
  return years
}
