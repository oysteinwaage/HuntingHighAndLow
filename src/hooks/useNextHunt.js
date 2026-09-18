import { useEffect, useState } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { db } from '../firebase'
import { getDefaultHuntDates, isPast, parseDateString, toDateString } from '../utils/huntDates'

function resolveYear(year, overrides) {
  const override = overrides?.[year]
  if (override?.start && override?.end) {
    return {
      year,
      start: parseDateString(override.start),
      end: parseDateString(override.end),
      overridden: true,
    }
  }
  return { year, ...getDefaultHuntDates(year), overridden: false }
}

// The "next hunt": this year's hunt until it's over, then next year's.
export function useNextHunt() {
  const [overrides, setOverrides] = useState(null)

  useEffect(() => {
    return onValue(ref(db, 'huntDates'), (snapshot) => {
      setOverrides(snapshot.val() || {})
    })
  }, [])

  if (overrides === null) {
    return { hunt: null, loading: true, setDates: async () => {}, resetDates: async () => {} }
  }

  const thisYear = new Date().getFullYear()
  const current = resolveYear(thisYear, overrides)
  const hunt = isPast(current.end) ? resolveYear(thisYear + 1, overrides) : current

  async function setDates(year, start, end) {
    await set(ref(db, `huntDates/${year}`), {
      start: toDateString(start),
      end: toDateString(end),
    })
  }

  async function resetDates(year) {
    await remove(ref(db, `huntDates/${year}`))
  }

  return { hunt, loading: false, setDates, resetDates }
}
