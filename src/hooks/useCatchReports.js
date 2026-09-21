import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// One catch report ("fangstrapport") per year, keyed by year. Each report has
// a hunting period, a set of participants, and a list of hunt days; each
// hunt day has a hunting area and a list of catches (participant, species,
// count) so totals can be aggregated per participant/species for statistics.
export function useCatchReports() {
  const { user } = useAuth()
  const [reportsByYear, setReportsByYear] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const reportsRef = ref(db, 'catchReports')
    return onValue(
      reportsRef,
      (snapshot) => {
        setReportsByYear(snapshot.val() || {})
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
  }, [])

  async function addReport(year, { startDate, endDate, participants }) {
    const yearRef = ref(db, `catchReports/${year}`)
    await set(yearRef, {
      startDate,
      endDate,
      participants,
      createdByUid: user?.uid ?? null,
      createdByName: user?.displayName ?? null,
      updatedAt: Date.now(),
    })
  }

  async function updateParticipants(year, participants) {
    await update(ref(db, `catchReports/${year}`), { participants, updatedAt: Date.now() })
  }

  async function removeReport(year) {
    await remove(ref(db, `catchReports/${year}`))
  }

  async function addHuntDay(year, { date, area }) {
    const dayRef = push(ref(db, `catchReports/${year}/huntDays`))
    await set(dayRef, { date, area })
  }

  async function removeHuntDay(year, dayId) {
    await remove(ref(db, `catchReports/${year}/huntDays/${dayId}`))
  }

  async function addCatch(year, dayId, { participantUid, participantName, species, count }) {
    const catchRef = push(ref(db, `catchReports/${year}/huntDays/${dayId}/catches`))
    await set(catchRef, { participantUid, participantName, species, count })
  }

  async function removeCatch(year, dayId, catchId) {
    await remove(ref(db, `catchReports/${year}/huntDays/${dayId}/catches/${catchId}`))
  }

  return {
    reportsByYear,
    loading,
    error,
    addReport,
    updateParticipants,
    removeReport,
    addHuntDay,
    removeHuntDay,
    addCatch,
    removeCatch,
  }
}
