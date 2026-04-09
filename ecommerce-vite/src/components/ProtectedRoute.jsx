import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-[#0e0e0e] px-6 py-4 text-sm text-zinc-400">Loading secure session...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
