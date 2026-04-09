import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password.length < 6) {
      setToast({ message: 'Use at least 6 characters for the new password.', type: 'error' })
      return
    }

    if (password !== confirm) {
      setToast({ message: 'Passwords do not match.', type: 'error' })
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)

    if (error) {
      setToast({ message: error.message || 'Unable to update password.', type: 'error' })
      return
    }

    setComplete(true)
    setToast({ message: 'Password updated successfully.', type: 'success' })
    setTimeout(() => navigate('/login'), 1200)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-[#0e0e0e] p-10 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="text-xl font-bold tracking-tighter">OBSIDIAN_FORGE</Link>
          <Link to="/login" className="text-sm text-neutral-400 hover:text-white">Back to Login</Link>
        </div>

        {complete ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-6 text-sm font-black">OK</div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Access Restored</h1>
            <p className="text-neutral-400 leading-7">Your password has been updated. Redirecting you to sign in.</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Reset Password</h1>
            <p className="text-neutral-400 leading-7 mb-8">
              Set a fresh access key for your forge account. Use the reset link from your email, then save the new password here.
            </p>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500">New Password</label>
                <input
                  className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a secure password"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500">Confirm Password</label>
                <input
                  className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="Repeat your password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50">
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
