import { useEffect, useState } from 'react'
import { onValue, ref } from 'firebase/database'
import { db } from '../firebase'

// All registered users, for pickers like "assign to user".
export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const usersRef = ref(db, 'users')
    return onValue(usersRef, (snapshot) => {
      const value = snapshot.val() || {}
      const list = Object.entries(value).map(([uid, u]) => ({
        uid,
        displayName: u.displayName || u.email || 'Ukjent bruker',
        roles: u.roles || [],
      }))
      list.sort((a, b) => a.displayName.localeCompare(b.displayName, 'no'))
      setUsers(list)
      setLoading(false)
    })
  }, [])

  return { users, loading }
}
