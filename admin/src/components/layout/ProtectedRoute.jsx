import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-mutedBrown">
            Loading Admin Session…
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}

