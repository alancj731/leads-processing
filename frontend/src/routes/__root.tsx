import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider, useAuth } from '../lib/AuthContext'
import { LoginPage } from '../components/LoginPage'

function AuthGate() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="apple-spinner" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border-light">
        <span className="text-sm text-text-tertiary">
          {user.email}
        </span>
        <button
          onClick={logout}
          className="text-sm text-blue font-medium hover:underline transition-colors"
        >
          Sign Out
        </button>
      </div>

      <Outlet />
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  ),
})
