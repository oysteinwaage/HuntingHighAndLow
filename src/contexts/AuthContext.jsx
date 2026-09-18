import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { get, onValue, ref, set, update } from 'firebase/database'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setRoles([])
      return
    }
    return onValue(ref(db, `users/${user.uid}/roles`), (snapshot) => {
      setRoles(snapshot.val() || [])
    })
  }, [user])

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    const { uid, displayName, email, photoURL } = result.user
    const userRef = ref(db, `users/${uid}`)
    const snapshot = await get(userRef)
    if (snapshot.exists()) {
      await update(userRef, { displayName, email, photoURL })
    } else {
      await set(userRef, { displayName, email, photoURL, roles: ['JEGER'] })
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  const isAdmin = roles.includes('ADMIN')

  const value = { user, loading, roles, isAdmin, signInWithGoogle, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
