import { useEffect, useState } from 'react'
import { get, onValue, push, ref, remove, set, update } from 'firebase/database'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

// Generic hook for a list of items stored at `${basePath}/items/{id}`.
// Each item looks like: { name, checked, createdAt, addedBy, addedByName }
export function useItemList(basePath) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!basePath) return
    setLoading(true)
    setError(null)
    const itemsRef = ref(db, `${basePath}/items`)
    return onValue(
      itemsRef,
      (snapshot) => {
        const value = snapshot.val() || {}
        const list = Object.entries(value).map(([id, item]) => ({ id, ...item }))
        list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
        setItems(list)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )
  }, [basePath])

  async function addItem(name, extra = {}) {
    const trimmed = name.trim()
    if (!trimmed) return
    const itemsRef = ref(db, `${basePath}/items`)
    const newRef = push(itemsRef)
    await set(newRef, {
      name: trimmed,
      checked: false,
      createdAt: Date.now(),
      addedBy: user?.uid ?? null,
      addedByName: user?.displayName ?? null,
      ...extra,
    })
  }

  async function toggleItem(id, checked) {
    await update(ref(db, `${basePath}/items/${id}`), {
      checked,
      checkedBy: checked ? (user?.uid ?? null) : null,
      checkedByName: checked ? (user?.displayName ?? null) : null,
    })
  }

  async function removeItem(id) {
    await remove(ref(db, `${basePath}/items/${id}`))
  }

  // One-time seed with a fixed set of default names, e.g. for pre-filling a
  // template list. No-ops if the list already has items or was seeded before.
  async function seedIfEmpty(names) {
    const seededSnapshot = await get(ref(db, `${basePath}/meta/seeded`))
    if (seededSnapshot.val()) return
    const itemsSnapshot = await get(ref(db, `${basePath}/items`))
    if (itemsSnapshot.exists()) {
      await set(ref(db, `${basePath}/meta/seeded`), true)
      return
    }
    const updates = {}
    names.forEach((name) => {
      const newRef = push(ref(db, `${basePath}/items`))
      updates[`${basePath}/items/${newRef.key}`] = {
        name,
        checked: false,
        createdAt: Date.now(),
        addedBy: user?.uid ?? null,
        addedByName: user?.displayName ?? null,
      }
    })
    updates[`${basePath}/meta/seeded`] = true
    await update(ref(db), updates)
  }

  return { items, loading, error, addItem, toggleItem, removeItem, seedIfEmpty }
}
