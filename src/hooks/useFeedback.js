import { useEffect, useState } from 'react'
import { onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export const FEEDBACK_TYPES = {
  FEIL: 'FEIL',
  FORSLAG: 'FORSLAG',
  ANNET: 'ANNET',
}

export const FEEDBACK_TYPE_LABELS = {
  [FEEDBACK_TYPES.FEIL]: 'Feil / problem',
  [FEEDBACK_TYPES.FORSLAG]: 'Forbedringsforslag',
  [FEEDBACK_TYPES.ANNET]: 'Annet',
}

export function useSubmitFeedback() {
  const { user } = useAuth()

  return async function submitFeedback(type, message) {
    const trimmed = message.trim()
    if (!trimmed) return
    const feedbackRef = push(ref(db, 'feedback'))
    await set(feedbackRef, {
      userId: user?.uid ?? null,
      userName: user?.displayName ?? 'Ukjent bruker',
      type,
      message: trimmed,
      read: false,
      createdAt: Date.now(),
    })
  }
}

// Only subscribes to the feedback list when `enabled` is true (admin view).
export function useFeedbackList(enabled) {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled))

  useEffect(() => {
    if (!enabled) {
      setFeedbackList([])
      setLoading(false)
      return
    }
    setLoading(true)
    return onValue(ref(db, 'feedback'), (snapshot) => {
      const value = snapshot.val() || {}
      setFeedbackList(
        Object.entries(value)
          .map(([id, entry]) => ({ id, ...entry }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      )
      setLoading(false)
    })
  }, [enabled])

  async function markRead(id, read) {
    await update(ref(db, `feedback/${id}`), { read })
  }

  async function removeFeedback(id) {
    await remove(ref(db, `feedback/${id}`))
  }

  const unreadCount = feedbackList.filter((entry) => !entry.read).length

  return { feedbackList, loading, unreadCount, markRead, removeFeedback }
}
