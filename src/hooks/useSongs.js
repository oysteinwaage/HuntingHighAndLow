import { useEffect, useState } from 'react'
import { increment, onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// Lenker til jaktlagets sanger (fra Suno), nyeste først.
export function useSongs() {
  const { user } = useAuth()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const songsRef = ref(db, 'songs')
    return onValue(
      songsRef,
      (snapshot) => {
        const value = snapshot.val() || {}
        const list = Object.entries(value)
          .map(([id, song]) => ({ id, ...song }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setSongs(list)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
  }, [])

  async function addSong(title, url) {
    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()
    if (!trimmedTitle || !trimmedUrl) return
    const newRef = push(ref(db, 'songs'))
    await set(newRef, {
      title: trimmedTitle,
      url: trimmedUrl,
      createdAt: Date.now(),
      addedByUid: user?.uid ?? null,
      addedByName: user?.displayName ?? null,
    })
  }

  async function removeSong(id) {
    await remove(ref(db, `songs/${id}`))
  }

  // Bumps the song's total play count and this user's own count for it, so
  // an admin overview can show how many times each user has played each song.
  async function incrementSongPlay(id) {
    if (!user?.uid) return
    await update(ref(db, `songs/${id}`), {
      playCount: increment(1),
      [`userPlays/${user.uid}`]: increment(1),
    })
  }

  return { songs, loading, error, addSong, removeSong, incrementSongPlay }
}
