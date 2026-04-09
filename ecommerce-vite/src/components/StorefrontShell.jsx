import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdaptiveImage from './AdaptiveImage'
import { useCartStore } from '../store/cartStore'
import { useAuth } from '../context/AuthContext'

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="text-zinc-600 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4">
      {children}
    </Link>
  )
}

export function StorefrontNav({ active = '', showSearch = false, showMarket = true, showSupport = true }) {
  const navigate = useNavigate()
  const { items } = useCartStore()
  const { user, profile } = useAuth()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const linkClass = (name) =>
    active === name
      ? 'text-white font-semibold border-b border-white py-1'
      : 'text-zinc-500 hover:text-zinc-200 transition-colors'

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <nav className="flex justify-between items-center h-16 px-6 max-w-screen-2xl mx-auto font-sans tracking-tight antialiased">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-white">OBSIDIAN_FORGE</Link>
          <div className="hidden md:flex items-center gap-6">
            {showMarket ? <Link className={linkClass('market')} to={user ? '/products' : '/login'}>Shop</Link> : null}
            <Link className={linkClass('about')} to={{ pathname: '/', hash: '#about' }}>About Us</Link>
            <Link className={linkClass('labs')} to={{ pathname: '/', hash: '#labs' }}>Labs</Link>
            {showSupport ? <Link className={linkClass('support')} to="/support">Support</Link> : null}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 transition-all duration-300 rounded-lg text-white relative" onClick={() => navigate(user ? '/cart' : '/login')}>
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </button>
          <button className="p-2 hover:bg-white/10 transition-all duration-300 rounded-lg text-white w-10 h-10 flex items-center justify-center overflow-hidden" onClick={() => navigate(user ? '/dashboard' : '/login')}>
            {profile?.avatar_url ? (
              <AdaptiveImage className="w-full h-full object-cover rounded-full" src={profile.avatar_url} alt={profile.full_name || user?.email || 'Profile'} fallbackLabel="Profile" />
            ) : (
              <span className="material-symbols-outlined">account_circle</span>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default function StorefrontShell({ active, children, footer = true, showSearch = false, showMarket = true, showSupport = true }) {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const id = location.hash.replace('#', '')
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash])

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-primary selection:text-on-primary relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)] opacity-70" />
      <StorefrontNav active={active} showSearch={showSearch} showMarket={showMarket} showSupport={showSupport} />
      <main className="pt-16 relative z-10">{children}</main>
      {footer && (
        <footer className="w-full border-t border-white/5 pt-20 pb-10 bg-black/90 font-mono text-xs uppercase tracking-widest relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 max-w-screen-2xl mx-auto">
            <div className="col-span-2 md:col-span-1">
              <span className="text-lg font-black text-white block mb-6">OBSIDIAN FORGE</span>
              <p className="text-zinc-600 normal-case tracking-normal max-w-[220px]">
                Constructing the future of compute, precision hardware, and premium workflow systems.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><FooterLink to="/products">Hardware</FooterLink></li>
                <li><FooterLink to="/products">Software</FooterLink></li>
                <li><FooterLink to="/dashboard">Security</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a className="text-zinc-600 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4" href="#details">Privacy</a></li>
                <li><a className="text-zinc-600 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4" href="#details">Terms</a></li>
                <li><a className="text-zinc-600 hover:text-white transition-colors underline decoration-zinc-700 underline-offset-4" href="#details">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Orders</h4>
              <ul className="space-y-4">
                <li><FooterLink to="/order-tracking">Tracking</FooterLink></li>
                <li><FooterLink to="/dashboard/billing">Billing</FooterLink></li>
                <li><FooterLink to="/dashboard/settings">Settings</FooterLink></li>
              </ul>
            </div>
          </div>
          <div className="max-w-screen-2xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-zinc-600">(c) 2026 OBSIDIAN FORGE. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-6">
              <a className="text-zinc-600 hover:text-white transition-opacity" href="#details"><span className="material-symbols-outlined text-sm">terminal</span></a>
              <a className="text-zinc-600 hover:text-white transition-opacity" href="#details"><span className="material-symbols-outlined text-sm">code</span></a>
              <a className="text-zinc-600 hover:text-white transition-opacity" href="#details"><span className="material-symbols-outlined text-sm">language</span></a>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
