import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// All experience entries across all years, grouped by year (newest first).
export function useExperiences() {
  const { user } = useAuth()
  const [entriesByYear, setEntriesByYear] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const experiencesRef = ref(db, 'experiences')
    return onValue(
      experiencesRef,
      (snapshot) => {
        const value = snapshot.val() || {}
        const years = Object.entries(value)
          .map(([year, entries]) => ({
            year: Number(year),
            entries: Object.entries(entries || {})
              .map(([id, entry]) => ({ id, ...entry }))
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
          }))
          .sort((a, b) => b.year - a.year)
        setEntriesByYear(years)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
  }, [])

  async function addEntry(year, text, type) {
    const trimmed = text.trim()
    if (!trimmed) return
    const entriesRef = ref(db, `experiences/${year}`)
    const newRef = push(entriesRef)
    await set(newRef, {
      text: trimmed,
      type,
      createdAt: Date.now(),
      authorUid: user?.uid ?? null,
      authorName: user?.displayName ?? null,
    })
  }

  async function removeEntry(year, id) {
    await remove(ref(db, `experiences/${year}/${id}`))
  }

  return { entriesByYear, loading, error, addEntry, removeEntry }
}
