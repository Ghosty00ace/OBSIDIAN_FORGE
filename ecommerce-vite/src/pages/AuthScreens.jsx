import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

function AuthFrame({ title, subtitle, alternate, children, social = false, onSocial }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="text-xl font-bold tracking-tighter">OBSIDIAN_FORGE</Link>
          {alternate}
        </div>
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tighter mb-4">{title}</h1>
          <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase">{subtitle}</p>
        </div>
        <div className="bg-[#0e0e0e] border border-[#222] rounded-xl p-10 space-y-6">
          {social ? (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => onSocial?.('google')} className="border border-white/10 rounded-lg py-3 text-sm font-semibold hover:bg-white/5 transition-all">Google</button>
              <button type="button" onClick={() => onSocial?.('github')} className="border border-white/10 rounded-lg py-3 text-sm font-semibold hover:bg-white/5 transition-all">GitHub</button>
            </div>
          ) : null}
          {social ? <div className="text-center text-zinc-600 text-xs uppercase tracking-widest">or use email</div> : null}
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginScreen() {
  const { signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }
    setToast({ message: 'Welcome back!', type: 'success' })
    setTimeout(() => navigate('/dashboard'), 800)
  }

  const handleSocial = async (provider) => {
    const { error } = await signInWithOAuth(provider)
    if (error) {
      const message = error.message?.includes('provider is not enabled')
        ? `${provider[0].toUpperCase()}${provider.slice(1)} login is not enabled in Supabase yet. Turn it on in Authentication > Sign In / Providers.`
        : error.message || `Unable to continue with ${provider}.`
      setToast({ message, type: 'error' })
    }
  }

  return (
    <>
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <AuthFrame title="ACCESS CORE" subtitle="Identity Verification Required" social onSocial={handleSocial} alternate={<Link to="/signup" className="text-sm text-neutral-400 hover:text-white">Sign Up</Link>}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500">Terminal.Identity</label>
            <input className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500">Access.Key</label>
              <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Forgot?</Link>
            </div>
            <input className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          <p className="text-center text-neutral-500 text-sm">
            No account? <Link to="/signup" className="text-white hover:underline">Sign Up</Link>
          </p>
        </form>
      </AuthFrame>
    </>
  )
}

export function SignupScreen() {
  const { signUp, signInWithOAuth } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirm) return setToast({ message: 'Passwords do not match.', type: 'error' })
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.name)
    setLoading(false)
    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }
    setToast({ message: 'Account created. Check your inbox.', type: 'success' })
    setTimeout(() => navigate('/login'), 1200)
  }

  const handleSocial = async (provider) => {
    const { error } = await signInWithOAuth(provider)
    if (error) {
      const message = error.message?.includes('provider is not enabled')
        ? `${provider[0].toUpperCase()}${provider.slice(1)} signup is not enabled in Supabase yet. Turn it on in Authentication > Sign In / Providers.`
        : error.message || `Unable to continue with ${provider}.`
      setToast({ message, type: 'error' })
    }
  }

  return (
    <>
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <AuthFrame title="JOIN THE FORGE" subtitle="Create Your Access Profile" social onSocial={handleSocial} alternate={<Link to="/login" className="text-sm text-neutral-400 hover:text-white">Log In</Link>}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            ['name', 'Full Name', 'text', 'John Doe'],
            ['email', 'Email Address', 'email', 'name@domain.com'],
            ['password', 'Password', 'password', 'Create a secure password'],
            ['confirm', 'Confirm Password', 'password', 'Repeat your password'],
          ].map(([key, label, type, placeholder]) => (
            <div key={key} className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500">{label}</label>
              <input className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all" type={type} value={form[key]} onChange={setField(key)} placeholder={placeholder} required />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </AuthFrame>
    </>
  )
}

export function ForgotPasswordScreen() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }
    setSent(true)
    setToast({ message: 'Reset link sent.', type: 'success' })
  }

  return (
    <>
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <AuthFrame title="RESET ACCESS" subtitle="Password Recovery Protocol" alternate={<Link to="/login" className="text-sm text-neutral-400 hover:text-white">Back to Login</Link>}>
        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">OK</div>
            <h2 className="text-xl font-bold">Reset Link Sent</h2>
            <p className="text-neutral-400 text-sm">Check your email at <span className="text-white font-mono">{email}</span></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500">Recovery Email</label>
              <input className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.com" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </AuthFrame>
    </>
  )
}
