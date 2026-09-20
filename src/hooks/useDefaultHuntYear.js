import { useState } from 'react'
import { useNextHunt } from './useNextHunt'
import { clampHuntingYear } from '../utils/year'

// Year-selector state that starts on the next upcoming hunt's year: this
// year until its hunt is over, then next year. The correct year is worked
// out from `useNextHunt` up front, before the caller renders anything
// year-scoped — `ready` is false until then, so a page can hold off
// rendering its year selector/list instead of flashing the current year and
// then jumping to next year. Once the user picks a year themselves, that
// choice sticks regardless of the hunt dates.
export function useDefaultHuntYear() {
  const { hunt, loading } = useNextHunt()
  const [touchedYear, setTouchedYear] = useState(null)

  const year = touchedYear ?? (hunt ? clampHuntingYear(hunt.year) : null)

  function handleYearChange(newYear) {
    setTouchedYear(newYear)
  }

  return { year, onChange: handleYearChange, ready: !loading }
}
