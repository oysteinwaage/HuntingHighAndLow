import { useEffect, useState } from 'react'
import { get, onValue, ref, update } from 'firebase/database'
import { db } from '../firebase'

// All registered users, for the admin "Brukere" module — plus a cascading
// delete that removes the user's profile and personal lists, and strips
// them as an assignee from any prep tasks living in other users' lists.
export function useAdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onValue(ref(db, 'users'), (snapshot) => {
      const value = snapshot.val() || {}
      const list = Object.entries(value).map(([uid, u]) => ({ uid, ...u }))
      list.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '', 'no'))
      setUsers(list)
      setLoading(false)
    })
  }, [])

  async function deleteUser(targetUser) {
    const { uid, displayName } = targetUser
    const prepListsSnapshot = await get(ref(db, 'prepLists'))
    const prepLists = prepListsSnapshot.val() || {}
    const updates = {}

    // Tasks assigned to this user live as copies in *other* users' private
    // lists too (see usePrepTaskActions). Their own lists are wiped below,
    // so only cross-user copies need cleaning up here.
    Object.entries(prepLists).forEach(([ownerUid, years]) => {
      if (ownerUid === uid) return
      Object.entries(years || {}).forEach(([year, yearData]) => {
        Object.entries(yearData?.items || {}).forEach(([itemId, item]) => {
          const assignedTo = Array.isArray(item.assignedTo) ? item.assignedTo : []
          if (!assignedTo.includes(uid)) return
          const base = `prepLists/${ownerUid}/${year}/items/${itemId}`
          if (item.addedBy === uid) {
            // The deleted user created this task; it has no remaining
            // owner who could manage it, so remove this copy too.
            updates[base] = null
            return
          }
          updates[`${base}/assignedTo`] = assignedTo.filter((assignee) => assignee !== uid)
          if (item.assignedToName && displayName) {
            const remainingNames = item.assignedToName
              .split(',')
              .map((name) => name.trim())
              .filter((name) => name && name !== displayName)
            updates[`${base}/assignedToName`] = remainingNames.length > 0 ? remainingNames.join(', ') : null
          }
        })
      })
    })

    updates[`users/${uid}`] = null
    updates[`prepLists/${uid}`] = null
    updates[`packingLists/${uid}`] = null

    await update(ref(db), updates)
  }

  return { users, loading, deleteUser }
}
