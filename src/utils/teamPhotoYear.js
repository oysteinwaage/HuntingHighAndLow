import { SEASON_OPEN_DAY, SEASON_OPEN_MONTH } from './huntDates'

export const MIN_TEAM_PHOTO_YEAR = 2002

// The current year only becomes selectable once the season has opened
// (10. september) — before that, the max selectable year is last year.
export function getMaxTeamPhotoYear(referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const seasonOpen = new Date(year, SEASON_OPEN_MONTH, SEASON_OPEN_DAY)
  return referenceDate >= seasonOpen ? year : year - 1
}

// Selectable years, newest first: from the max selectable year down to MIN_TEAM_PHOTO_YEAR.
export function getTeamPhotoYearOptions(referenceDate = new Date()) {
  const years = []
  for (let y = getMaxTeamPhotoYear(referenceDate); y >= MIN_TEAM_PHOTO_YEAR; y--) {
    years.push(y)
  }
  return years
}
