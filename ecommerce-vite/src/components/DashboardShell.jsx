import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdaptiveImage from './AdaptiveImage'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Overview' },
  { to: '/dashboard/profile', icon: 'person', label: 'Profile' },
  { to: '/dashboard/wishlist', icon: 'favorite', label: 'Wishlist' },
  { to: '/dashboard/settings', icon: 'settings', label: 'Settings' },
  { to: '/dashboard/billing', icon: 'payments', label: 'Billing' },
  { to: '/dashboard/tracking', icon: 'local_shipping', label: 'Tracking' },
]

export default function DashboardShell({ title, subtitle, children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-2xl border-b border-white/10">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <Link to="/" className="text-xl font-bold tracking-tighter text-white uppercase">OBSIDIAN_FORGE</Link>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white hover:bg-white/10 transition-all rounded-full" onClick={() => navigate('/cart')}>
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
            <button className="p-2 text-white hover:bg-white/10 transition-all rounded-full" onClick={() => navigate('/dashboard/settings')}>
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-8 h-8 rounded-full bg-white/10 overflow-hidden border border-white/10 flex items-center justify-center" onClick={() => navigate('/dashboard/profile')}>
              {profile?.avatar_url ? (
                <AdaptiveImage className="w-full h-full object-cover" src={profile.avatar_url} alt={profile.full_name || user?.email || 'Profile'} fallbackLabel="Profile" />
              ) : (
                <span className="material-symbols-outlined text-sm">person</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 min-h-screen">
        <aside className="hidden md:flex h-[calc(100vh-64px)] sticky top-16 w-64 border-r border-white/5 bg-[#0e0e0e] flex-col py-6 px-4">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
              </div>
              <span className="text-lg font-black text-white">Project Obsidian</span>
            </div>
            <span className="font-mono text-sm tracking-tight text-neutral-500">{profile?.full_name || user?.email || 'Member'}</span>
          </div>

          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 font-mono text-sm tracking-tight rounded-lg transition-colors ${
                    active ? 'text-white bg-white/10 font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 border-t border-white/5 pt-6">
            <Link to="/products" className="flex items-center gap-3 px-3 py-2 font-mono text-sm tracking-tight text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <span>Marketplace</span>
            </Link>
            <button
              className="flex items-center gap-3 px-3 py-2 font-mono text-sm tracking-tight text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              onClick={async () => {
                await signOut()
                navigate('/')
              }}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-black p-8 md:p-12">
          <div className="max-w-6xl mx-auto space-y-10">
            <header className="space-y-3">
              <h1 className="text-5xl font-bold tracking-tighter text-white">{title}</h1>
              {subtitle ? <p className="text-neutral-400 max-w-2xl text-lg">{subtitle}</p> : null}
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
