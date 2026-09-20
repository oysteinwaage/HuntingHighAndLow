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
  const [onboardingCompleted, setOnboardingCompleted] = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)

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

  // null = not yet known, false = needs onboarding, true = done.
  useEffect(() => {
    if (!user) {
      setOnboardingCompleted(null)
      return
    }
    return onValue(ref(db, `users/${user.uid}/onboardingCompleted`), (snapshot) => {
      setOnboardingCompleted(!!snapshot.val())
    })
  }, [user])

  // Stamps `lastLogin` on every resolved session (fresh sign-in and
  // persisted session restore alike), so the admin user list reflects
  // actual recent use, not just explicit sign-ins.
  useEffect(() => {
    if (!user) return
    update(ref(db, `users/${user.uid}`), { lastLogin: Date.now() })
  }, [user])

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    const { uid, displayName, email, photoURL } = result.user
    const userRef = ref(db, `users/${uid}`)
    const snapshot = await get(userRef)
    const now = Date.now()
    if (snapshot.exists()) {
      await update(userRef, { displayName, email, photoURL, lastLogin: now })
    } else {
      await set(userRef, { displayName, email, photoURL, roles: ['JEGER'], createdAt: now, lastLogin: now })
      setIsNewUser(true)
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  async function completeOnboarding() {
    if (!user) return
    await update(ref(db, `users/${user.uid}`), { onboardingCompleted: true })
  }

  // Increments the user's shot-ptarmigan counter and returns the new total.
  async function incrementRypeCount() {
    if (!user) return null
    const userRef = ref(db, `users/${user.uid}`)
    const snapshot = await get(userRef)
    const next = (snapshot.val()?.rypeCount || 0) + 1
    await update(userRef, { rypeCount: next })
    return next
  }

  const isAdmin = roles.includes('ADMIN')

  const value = {
    user,
    loading,
    roles,
    isAdmin,
    onboardingCompleted,
    isNewUser,
    signInWithGoogle,
    signOut,
    completeOnboarding,
    incrementRypeCount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
