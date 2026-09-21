import { useEffect, useRef, useState } from 'react'
import { get, onValue, ref, remove, set, update } from 'firebase/database'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { compressImage } from '../utils/compressImage'

const CACHE_KEY = 'teamPhotosCache'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(version, photosByYear) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version, photosByYear }))
  } catch {
    // Full/unavailable storage — caching is a pure optimization, safe to skip.
  }
}

// One team photo ("lagbilde") per year, keyed by year. The photo list is
// cached in localStorage and only refetched when `teamPhotosVersion` (a
// lightweight marker bumped on upload/delete) has changed since last time,
// so a plain app reload doesn't re-download the whole list from the server.
export function useTeamPhotos() {
  const { user } = useAuth()
  const cache = useRef(readCache())
  const [photosByYear, setPhotosByYear] = useState(() => readCache()?.photosByYear || {})
  const [loading, setLoading] = useState(() => !readCache())
  const [error, setError] = useState(null)

  useEffect(() => {
    return onValue(
      ref(db, 'teamPhotosVersion'),
      (snapshot) => {
        const version = snapshot.val() ?? null
        if (cache.current && cache.current.version === version) {
          setLoading(false)
          return
        }
        get(ref(db, 'teamPhotos'))
          .then((snap) => {
            const data = snap.val() || {}
            setPhotosByYear(data)
            cache.current = { version, photosByYear: data }
            writeCache(version, data)
          })
          .catch(setError)
          .finally(() => setLoading(false))
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
  }, [])

  async function bumpVersion() {
    await set(ref(db, 'teamPhotosVersion'), Date.now())
  }

  async function uploadPhoto(year, file) {
    const yearRef = ref(db, `teamPhotos/${year}`)
    const existing = await get(yearRef)
    if (existing.exists()) {
      throw new Error(`Det er allerede lastet opp et lagbilde for ${year}.`)
    }

    const compressed = await compressImage(file)
    const fileRef = storageRef(storage, `teamPhotos/${year}/lagbilde`)
    await uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' })
    const photoUrl = await getDownloadURL(fileRef)
    await update(yearRef, {
      photoUrl,
      updatedAt: Date.now(),
      uploadedByUid: user?.uid ?? null,
      uploadedByName: user?.displayName ?? null,
    })
    await bumpVersion()
  }

  async function deletePhoto(year) {
    const fileRef = storageRef(storage, `teamPhotos/${year}/lagbilde`)
    try {
      await deleteObject(fileRef)
    } catch {
      // Filen finnes ikke i Storage — fortsett uansett
    }
    await remove(ref(db, `teamPhotos/${year}`))
    await bumpVersion()
  }

  return { photosByYear, loading, error, uploadPhoto, deletePhoto }
}
