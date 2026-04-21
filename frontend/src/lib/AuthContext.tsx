import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'

interface AuthState {
  readonly user: User | null
  readonly loading: boolean
  readonly logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext value={{ user, loading, logout }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
