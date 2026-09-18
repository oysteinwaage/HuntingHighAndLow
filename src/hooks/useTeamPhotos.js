import { useEffect, useState } from 'react'
import { get, onValue, ref, remove, update } from 'firebase/database'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { compressImage } from '../utils/compressImage'

// One team photo ("lagbilde") per year, keyed by year.
export function useTeamPhotos() {
  const { user } = useAuth()
  const [photosByYear, setPhotosByYear] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const photosRef = ref(db, 'teamPhotos')
    return onValue(
      photosRef,
      (snapshot) => {
        setPhotosByYear(snapshot.val() || {})
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
  }, [])

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
  }

  async function deletePhoto(year) {
    const fileRef = storageRef(storage, `teamPhotos/${year}/lagbilde`)
    try {
      await deleteObject(fileRef)
    } catch {
      // Filen finnes ikke i Storage — fortsett uansett
    }
    await remove(ref(db, `teamPhotos/${year}`))
  }

  return { photosByYear, loading, error, uploadPhoto, deletePhoto }
}
