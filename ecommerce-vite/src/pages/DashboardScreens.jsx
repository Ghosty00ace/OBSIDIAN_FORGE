import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import AdaptiveImage from '../components/AdaptiveImage'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import Toast from '../components/Toast'
import { usePaymentStore } from '../store/paymentStore'
import { useWishlistStore } from '../store/wishlistStore'

const STATUS_COLORS = {
  confirmed: 'text-blue-300 border-blue-400/20',
  processing: 'text-amber-300 border-amber-400/20',
  shipped: 'text-purple-300 border-purple-400/20',
  delivered: 'text-emerald-300 border-emerald-400/20',
}

function downloadInvoiceFile(order, items) {
  const orderLabel = order?.id ? order.id.slice(0, 8).toUpperCase() : 'OB-000000'
  const lines = [
    'OBSIDIAN FORGE INVOICE',
    `Order ID: ${orderLabel}`,
    `Date: ${order?.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}`,
    `Status: ${order?.status || 'confirmed'}`,
    '',
    'Items',
    ...(items.length
      ? items.map((item) => {
          const name = item.products?.name || 'Catalog item'
          const quantity = item.quantity || 1
          const amount = Number(item.price_at_purchase * quantity || 0).toFixed(2)
          return `- ${name} x${quantity}  $${amount}`
        })
      : ['- Manifest pending']),
    '',
    `Total Paid: $${Number(order?.total || 0).toFixed(2)}`,
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `obsidian-forge-invoice-${orderLabel}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function DashboardScreen() {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { items: wishlist } = useWishlistStore()
  const latestOrder = orders[0] || null

  useEffect(() => {
    async function fetchOrders() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(quantity, price_at_purchase, products(name, image_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders])

  return (
    <DashboardShell title="Dashboard" subtitle={`Welcome back, ${profile?.full_name || user?.email || 'forge member'}. Monitor your orders, account settings, and premium hardware stack.`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          ['Total Orders', orders.length, 'inventory_2'],
          ['Total Spent', `$${totalSpent.toFixed(2)}`, 'payments'],
          ['Active Orders', orders.filter((item) => ['confirmed', 'processing', 'shipped'].includes(item.status)).length, 'local_shipping'],
        ].map(([label, value, icon]) => (
          <div key={label} className="bg-surface-container-low p-8 rounded-xl border border-white/5 relative overflow-hidden">
            <span className="material-symbols-outlined text-zinc-500 mb-5 block">{icon}</span>
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-mono">{label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Recent Orders</h2>
            <p className="text-zinc-500">Track fulfillment progress and review previous purchases.</p>
          </div>
          <Link to="/order-tracking" className="text-sm text-zinc-400 hover:text-white">Open tracking</Link>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-surface-container-low p-10 rounded-xl border border-white/5 text-center">
            <p className="text-zinc-400 mb-6">No orders yet. Start by browsing the marketplace.</p>
            <Link to="/products" className="bg-white text-black px-6 py-3 rounded-lg font-bold">Browse products</Link>
          </div>
        ) : (
          <div className="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Order</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Date</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Items</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Total</th>
                    <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5 text-white font-semibold">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-5 text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-zinc-400">{order.order_items?.length || 0}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest ${STATUS_COLORS[order.status] || 'text-white border-white/10'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-white">${Number(order.total || 0).toFixed(2)}</td>
                      <td className="px-6 py-5 text-right">
                        <Link to={`/order-tracking?order=${order.id}`} className="text-zinc-400 hover:text-white">Track</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Wishlist</h2>
          <p className="text-zinc-500">Saved systems you may want to return to later.</p>
        </div>
        {wishlist.length === 0 ? (
          <div className="bg-surface-container-low p-8 rounded-xl border border-white/5 text-zinc-500">Your wishlist is empty.</div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-surface-container-low p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tight">Wishlist Preview</h3>
                <p className="text-zinc-500 mt-2">Monitored assets and hardware upgrades.</p>
              </div>
              <Link to="/dashboard/wishlist" className="text-zinc-400 hover:text-white text-sm">Open wishlist</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {wishlist.slice(0, 3).map((item) => (
                <Link key={item.id} to={`/product?id=${item.id}`} className="rounded-2xl border border-white/10 bg-black overflow-hidden hover:border-white/25 transition-colors">
                  <div className="relative">
                    <AdaptiveImage className="w-full h-56 object-cover" src={item.image_url} alt={item.name} fallbackLabel={item.name} />
                    <div className="absolute top-4 right-4 h-10 w-10 rounded-2xl bg-black/80 border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-white text-xl font-semibold leading-7">{item.name}</p>
                      <span className="text-white font-mono">${Number(item.price || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-zinc-500 text-sm leading-6 line-clamp-2">{item.description || 'Precision-engineered forge hardware saved for your next upgrade cycle.'}</p>
                    <div className="rounded-lg bg-white/5 px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.24em] text-zinc-300">Add to terminal</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Tracking</h2>
            <p className="text-zinc-500">Live visibility into the most recent forge shipment.</p>
          </div>
          {latestOrder ? <Link to={`/order-tracking?order=${latestOrder.id}`} className="text-sm text-zinc-400 hover:text-white">Open tracking</Link> : null}
        </div>

        {!latestOrder ? (
          <div className="bg-surface-container-low p-10 rounded-xl border border-white/5">
            <h3 className="text-xl font-bold mb-3">No orders to track yet</h3>
            <p className="text-zinc-500 mb-6">Grab something from the forge marketplace and its live tracking status will appear here automatically.</p>
            <Link to="/products" className="inline-flex bg-white text-black px-5 py-3 rounded-lg font-semibold">Browse products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl border border-white/5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Tracking ID</p>
                  <h3 className="text-3xl font-bold tracking-tight mt-3">{latestOrder.id.slice(0, 8).toUpperCase()}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest ${STATUS_COLORS[latestOrder.status] || 'text-white border-white/10'}`}>
                  {latestOrder.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['confirmed', 'processing', 'shipped', 'delivered'].map((step, index) => {
                  const activeIndex = Math.max(['confirmed', 'processing', 'shipped', 'delivered'].indexOf(latestOrder.status), 0)
                  const active = index <= activeIndex
                  return (
                    <div key={step} className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${active ? 'bg-white text-black' : 'bg-[#1b1b1b] text-zinc-500'}`}>{index + 1}</div>
                      <p className={`font-mono text-[10px] uppercase tracking-[0.24em] ${active ? 'text-white' : 'text-zinc-500'}`}>{step}</p>
                    </div>
                  )
                })}
              </div>
            </article>
            <article className="bg-surface-container-low p-8 rounded-xl border border-white/5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Shipment Info</p>
              <div className="space-y-4 text-zinc-400">
                <div className="flex justify-between"><span>Total</span><span className="text-white">${Number(latestOrder.total || 0).toFixed(2)}</span></div>
                <div><span className="text-zinc-500">Address</span><p className="text-white mt-1">{latestOrder.shipping_address || 'Shipping address unavailable.'}</p></div>
              </div>
            </article>
          </div>
        )}
      </section>
    </DashboardShell>
  )
}

export function WishlistScreen() {
  const { items, toggleItem } = useWishlistStore()

  return (
    <DashboardShell title="Wishlist" subtitle="Saved forge systems, display upgrades, and precision tools waiting for your next move.">
      {items.length === 0 ? (
        <div className="bg-surface-container-low p-10 rounded-xl border border-white/5">
          <h3 className="text-2xl font-bold mb-3">Your wishlist is empty</h3>
          <p className="text-zinc-500 mb-6">Save standout products from the marketplace and they will appear here as a curated watchlist.</p>
          <Link to="/products" className="inline-flex bg-white text-black px-5 py-3 rounded-lg font-semibold">Browse products</Link>
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-surface-container-low p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black overflow-hidden">
                <div className="relative">
                  <AdaptiveImage className="w-full h-60 object-cover" src={item.image_url} alt={item.name} fallbackLabel={item.name} />
                  <button
                    onClick={() => toggleItem(item)}
                    className="absolute top-4 right-4 h-11 w-11 rounded-2xl bg-black/80 border border-white/10 flex items-center justify-center text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold leading-8">{item.name}</p>
                      <p className="text-zinc-500 text-sm mt-2">{item.category || 'Forge Series'}</p>
                    </div>
                    <span className="font-mono text-white text-lg">${Number(item.price || 0).toFixed(2)}</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-7 mt-5 line-clamp-3">{item.description || 'A premium hardware candidate saved from the marketplace for future consideration.'}</p>
                  <div className="mt-6 flex gap-3">
                    <Link to={`/product?id=${item.id}`} className="flex-1 rounded-xl bg-white text-black text-center py-3 font-semibold">Open Product</Link>
                    <button onClick={() => toggleItem(item)} className="rounded-xl border border-white/15 px-4 py-3 text-zinc-300 hover:bg-white/5">Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

export function TrackingHubScreen() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(quantity, price_at_purchase, products(name, image_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  const latestOrder = orders[0] || null

  return (
    <DashboardShell title="Tracking" subtitle="View shipment status, fulfillment progress, and live manifests for your latest forge orders.">
      {loading ? (
        <div className="text-zinc-500">Loading tracking...</div>
      ) : !latestOrder ? (
        <div className="bg-surface-container-low p-10 rounded-xl border border-white/5">
          <h3 className="text-xl font-bold mb-3">No orders to track yet</h3>
          <p className="text-zinc-500 mb-6">Grab something from the forge marketplace and its tracking status will appear here automatically.</p>
          <Link to="/products" className="inline-flex bg-white text-black px-5 py-3 rounded-lg font-semibold">Browse products</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="lg:col-span-2 bg-surface-container-low p-8 rounded-xl border border-white/5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Latest Shipment</p>
                  <h3 className="text-3xl font-bold tracking-tight mt-3">{latestOrder.id.slice(0, 8).toUpperCase()}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest ${STATUS_COLORS[latestOrder.status] || 'text-white border-white/10'}`}>
                  {latestOrder.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['confirmed', 'processing', 'shipped', 'delivered'].map((step, index) => {
                  const activeIndex = Math.max(['confirmed', 'processing', 'shipped', 'delivered'].indexOf(latestOrder.status), 0)
                  const active = index <= activeIndex
                  return (
                    <div key={step} className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${active ? 'bg-white text-black' : 'bg-[#1b1b1b] text-zinc-500'}`}>{index + 1}</div>
                      <p className={`font-mono text-[10px] uppercase tracking-[0.24em] ${active ? 'text-white' : 'text-zinc-500'}`}>{step}</p>
                    </div>
                  )
                })}
              </div>
            </article>
            <article className="bg-surface-container-low p-8 rounded-xl border border-white/5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Shipment Info</p>
              <div className="space-y-4 text-zinc-400">
                <div className="flex justify-between"><span>Total</span><span className="text-white">${Number(latestOrder.total || 0).toFixed(2)}</span></div>
                <div><span className="text-zinc-500">Address</span><p className="text-white mt-1">{latestOrder.shipping_address || 'Shipping address unavailable.'}</p></div>
              </div>
              <Link to={`/order-tracking?order=${latestOrder.id}`} className="block w-full mt-8 bg-white text-black py-4 font-bold text-sm rounded-lg text-center hover:bg-neutral-200">
                Open Full Tracking
              </Link>
            </article>
          </div>

          <div className="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Order</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-500">Items</th>
                    <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-5 text-white">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-5 text-zinc-400 uppercase">{order.status}</td>
                      <td className="px-6 py-5 text-zinc-400">{order.order_items?.length || 0}</td>
                      <td className="px-6 py-5 text-right"><Link to={`/order-tracking?order=${order.id}`} className="text-zinc-400 hover:text-white">Track</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

export function ProfileScreen() {
  const { user, profile, updateProfile } = useAuth()
  const [form, setForm] = useState({ full_name: profile?.full_name || '', bio: profile?.bio || '', avatar_url: profile?.avatar_url || '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  useEffect(() => {
    setForm({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || '',
    })
  }, [profile])

  const handleAvatarFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please upload an image file.', type: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, avatar_url: reader.result }))
      setToast({ message: 'Avatar ready to save.', type: 'info' })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await updateProfile(form)
    setLoading(false)
    setToast(error ? { message: error.message, type: 'error' } : { message: 'Profile updated.', type: 'success' })
  }

  return (
    <>
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <DashboardShell title="Profile Settings" subtitle="Manage your forge identity, contact details, and visible account information.">
        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-8 bg-surface-container-low p-8 rounded-xl border border-white/5 flex flex-col md:flex-row gap-10">
            <div className="relative space-y-4">
              <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-white/10 bg-surface-container-high flex items-center justify-center">
                {form.avatar_url ? (
                  <AdaptiveImage className="w-full h-full object-cover" src={form.avatar_url} alt={form.full_name || 'Profile avatar'} fallbackLabel="Profile avatar" />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-zinc-500">person</span>
                )}
              </div>
              <label
                className="block rounded-xl border border-dashed border-white/15 bg-black/30 px-4 py-4 text-center cursor-pointer hover:border-white/30 transition-colors"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  handleAvatarFile(event.dataTransfer.files?.[0])
                }}
              >
                <input className="hidden" type="file" accept="image/*" onChange={(event) => handleAvatarFile(event.target.files?.[0])} />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 block mb-2">Profile Image</span>
                <span className="text-sm text-zinc-300">Drag and drop or click to upload</span>
              </label>
            </div>
            <form className="flex-1 space-y-6" onSubmit={handleSave}>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Display Name</label>
                <input className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-bold focus:border-white outline-none" value={form.full_name} onChange={setField('full_name')} />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Email</label>
                <input className="w-full bg-transparent border-b border-white/10 py-2 text-zinc-500 outline-none" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Bio / Designation</label>
                <textarea className="w-full bg-transparent border-b border-white/10 py-2 text-on-surface-variant focus:border-white outline-none resize-none" rows="3" value={form.bio} onChange={setField('bio')} />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Avatar Source</label>
                <input className="w-full bg-transparent border-b border-white/10 py-2 text-zinc-500 outline-none" value={form.avatar_url ? 'Custom image selected' : 'Default avatar'} disabled />
              </div>
              <button type="submit" disabled={loading} className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Identity'}
              </button>
            </form>
          </section>

          <section className="col-span-12 lg:col-span-4 bg-surface-container-high p-8 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Security Integrity</h3>
              <div className="flex items-center justify-between"><span>2FA Status</span><span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Available</span></div>
              <div className="flex items-center justify-between"><span>Last Login</span><span className="font-mono text-xs text-zinc-400">Current Session</span></div>
              <div className="flex items-center justify-between"><span>Auth Method</span><span className="font-mono text-xs text-zinc-400">Email / Password</span></div>
            </div>
            <Link to="/dashboard/settings" className="w-full mt-8 py-3 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] rounded-lg hover:bg-white/5 transition-colors text-center">
              Update Credentials
            </Link>
          </section>
        </div>
      </DashboardShell>
    </>
  )
}

export function SettingsScreen() {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    hardwareAlerts: true,
    maintenance: false,
    compactDashboard: false,
  })
  const [toast, setToast] = useState(null)

  const toggle = (key) => setSettings((current) => ({ ...current, [key]: !current[key] }))

  return (
    <>
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <DashboardShell title="Storefront Preferences" subtitle="Control your dashboard density, delivery updates, and system notifications.">
        <div className="grid gap-6">
          {[
            ['orderUpdates', 'Order Status Updates', 'Receive alerts for hardware forge progress.'],
            ['hardwareAlerts', 'Hardware Integrity Alerts', 'Critical warnings for thermal or stock thresholds.'],
            ['maintenance', 'System Maintenance', 'Scheduled downtime and documentation updates.'],
            ['compactDashboard', 'Compact Dashboard', 'Use denser tables and reduced dashboard spacing.'],
          ].map(([key, title, body]) => (
            <div key={key} className="flex items-center justify-between bg-surface-container-low p-8 rounded-xl border border-white/5">
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-zinc-500 mt-2">{body}</p>
              </div>
              <button
                type="button"
                className={`w-14 h-8 rounded-full relative transition-colors ${settings[key] ? 'bg-white' : 'bg-white/10 border border-white/10'}`}
                onClick={() => toggle(key)}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full transition-all ${settings[key] ? 'left-7 bg-black' : 'left-1 bg-white'}`} />
              </button>
            </div>
          ))}
          <div className="flex gap-4">
            <button onClick={() => setToast({ message: 'Settings saved.', type: 'success' })} className="px-6 py-3 bg-white text-black font-bold rounded-lg">Save settings</button>
          </div>
        </div>
      </DashboardShell>
    </>
  )
}

export function BillingScreen() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { methods, removeMethod, setDefaultMethod } = usePaymentStore()

  useEffect(() => {
    async function fetchOrders() {
      if (!user || !isSupabaseConfigured || !supabase) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(quantity, price_at_purchase, products(name, image_url))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders])
  const tier = totalSpent > 2500 ? 'Blackline' : totalSpent > 900 ? 'Forge Pro' : 'Core Access'

  return (
    <DashboardShell title="Billing & Subscription" subtitle="Manage order spend, payment history, and printable invoice records for your storefront.">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container-low p-8 rounded-xl border border-white/5">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-white/10 text-white text-[10px] font-mono uppercase tracking-widest rounded">Customer Account</span>
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">{user?.email || 'Guest Preview'}</h2>
              <p className="text-neutral-400 font-mono text-sm">Forge billing dashboard</p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
              <div><p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mb-1">Order Count</p><p className="text-xl font-bold text-white font-mono">{orders.length}</p></div>
              <div><p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest mb-1">Lifetime Spend</p><p className="text-xl font-bold text-white font-mono">${totalSpent.toFixed(2)}</p></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl border border-white flex flex-col justify-between text-black">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Usage Quota</p>
            <h3 className="text-3xl font-bold tracking-tighter">{Math.min(100, orders.length * 12 + 18)}%</h3>
            <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-black h-full" style={{ width: `${Math.min(100, orders.length * 12 + 18)}%` }} />
            </div>
          </div>
          <p className="text-sm font-medium leading-tight">Billing now reflects real ecommerce order activity instead of the original static SaaS placeholder.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {[
          ['Core Access', 'For casual buyers and curated storefront access.', totalSpent < 900],
          ['Forge Pro', 'Priority releases, earlier drops, and premium support.', totalSpent >= 900 && totalSpent < 2500],
          ['Blackline', 'Top tier service, concierge handling, and flagship access.', totalSpent >= 2500],
        ].map(([name, body, active]) => (
          <article key={name} className={`rounded-xl border p-6 ${active ? 'border-white bg-white text-black' : 'border-white/10 bg-surface-container-low text-white'}`}>
            <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${active ? 'text-black/60' : 'text-zinc-500'}`}>Tier</p>
            <h3 className="text-3xl font-bold tracking-tight mt-4 mb-3">{name}</h3>
            <p className={`${active ? 'text-black/70' : 'text-zinc-400'} leading-7`}>{body}</p>
            {active ? <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em]">Current Tier</p> : null}
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="rounded-xl border border-white/10 bg-surface-container-low p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Membership</p>
              <h3 className="text-3xl font-bold tracking-tight mt-3">{tier}</h3>
            </div>
            <span className="px-3 py-1 rounded-full border border-white/10 text-xs uppercase tracking-[0.24em] text-zinc-400">Tier Active</span>
          </div>
          <p className="text-zinc-400 leading-7">Your tier is calculated from completed order activity. It can later be connected to Stripe customer subscriptions without changing this UI flow.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-surface-container-low p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6">Payment Methods</p>
          <div className="space-y-4">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-4 gap-4">
                <div>
                  <p className="text-white font-semibold">{method.label}</p>
                  <p className="text-zinc-500 text-sm">{method.isDefault ? 'Default billing method' : 'Saved billing method'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!method.isDefault ? <button onClick={() => setDefaultMethod(method.id)} className="text-sm text-zinc-400 hover:text-white">Set default</button> : null}
                  {methods.length > 1 ? <button onClick={() => removeMethod(method.id)} className="text-sm text-zinc-500 hover:text-white">Remove</button> : null}
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{method.isDefault ? 'Default' : method.type}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight">Invoice History</h2>
        {loading ? (
          <div className="text-zinc-500">Loading billing history...</div>
        ) : orders.length === 0 ? (
          <div className="bg-surface-container-low border border-white/5 rounded-xl p-10">
            <h3 className="text-xl font-bold mb-3">No invoices yet</h3>
            <p className="text-zinc-500 mb-6">Once you place an order, billing history and purchased items will appear here.</p>
            <Link to="/products" className="inline-flex bg-white text-black px-5 py-3 rounded-lg font-semibold">Browse marketplace</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="bg-surface-container-low border border-white/5 rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 border-b border-white/5 bg-white/5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Invoice ID</p>
                    <p className="text-white font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Date</p>
                      <p className="text-zinc-300">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Amount</p>
                      <p className="text-white">${Number(order.total || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Status</p>
                      <p className="text-white uppercase">{order.status}</p>
                    </div>
                  </div>
                  <Link to={`/order-confirmation?order=${order.id}`} className="text-neutral-400 hover:text-white text-sm">View invoice</Link>
                </div>
                <div className="px-6 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-4">Items</p>
                  <div className="space-y-4">
                    {(order.order_items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <AdaptiveImage className="w-14 h-14 rounded-lg object-cover bg-[#111]" src={item.products?.image_url} alt={item.products?.name || 'Catalog item'} fallbackLabel={item.products?.name || 'Catalog item'} />
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.products?.name || 'Catalog item'}</p>
                          <p className="text-zinc-500 text-sm">Quantity {item.quantity}</p>
                        </div>
                        <span className="text-white font-mono">${Number(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}

export function OrderConfirmScreen() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')
  const payment = searchParams.get('payment') || 'card'
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!orderId || !isSupabaseConfigured || !supabase) return
    async function fetchOrder() {
      const { data: orderRow } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
      const { data: itemRows } = await supabase.from('order_items').select('*, products(name, image_url)').eq('order_id', orderId)
      setOrder(orderRow)
      setItems(itemRows || [])
    }
    fetchOrder()
  }, [orderId])

  const shortId = orderId ? orderId.slice(0, 8).toUpperCase() : 'OB-000000'
  const manifestItems = items.length
    ? items
    : [
        {
          id: 'manifest-fallback',
          quantity: 1,
          price_at_purchase: Number(order?.total || 0),
          products: { name: 'Forge hardware manifest pending', image_url: '' },
        },
      ]

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-24 h-24 rounded-[28px] bg-white text-black flex items-center justify-center mx-auto mb-8 border border-white/10">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">ORDER INITIALIZED</h1>
          <p className="text-zinc-400 text-xl leading-9 max-w-3xl mx-auto">Your transaction has been processed through the secure forge. Hardware provisioning is now in queue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10 rounded-2xl overflow-hidden mb-12">
          {[
            ['Order ID', `#${shortId}`],
            ['Transaction Date', order?.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()],
            ['Amount Paid', `$${Number(order?.total || 0).toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#171717] px-8 py-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">{label}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#171717] overflow-hidden mb-12">
          <div className="flex items-center justify-between gap-4 px-8 py-6 border-b border-white/10">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-white">Hardware Manifest</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{manifestItems.length} item{manifestItems.length > 1 ? 's' : ''} securely packed</p>
          </div>
          <div className="divide-y divide-white/10">
            {manifestItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-5 px-8 py-8">
                <AdaptiveImage className="w-24 h-24 rounded-xl object-cover bg-[#111]" src={item.products?.image_url} alt={item.products?.name || 'Catalog item'} fallbackLabel={item.products?.name || 'Catalog item'} />
                <div className="flex-1">
                  <p className="text-4xl md:text-2xl font-semibold tracking-tight">{item.products?.name || 'Catalog item'}</p>
                  <p className="text-zinc-500 text-lg md:text-base mt-2 leading-7">
                    {item.products?.description || 'Premium forge hardware is prepared and queued for shipment.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono text-2xl">${Number(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                  <p className="text-zinc-500 text-sm mt-2">Qty {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/dashboard" className="block text-center bg-white text-black font-semibold py-4 rounded-xl hover:bg-neutral-200">Return to Dashboard</Link>
          <button onClick={() => downloadInvoiceFile(order, manifestItems)} className="border border-white/15 py-4 rounded-xl hover:bg-white/5 font-semibold">
            Download Invoice
          </button>
          <Link to="/dashboard/billing" className="block text-center border border-white/15 py-4 rounded-xl hover:bg-white/5 font-semibold text-zinc-300">View Order History</Link>
        </div>
      </div>
    </div>
  )
}

export function OrderTrackingScreen() {
  const [searchParams, setSearchParams] = useSearchParams()
  const orderId = searchParams.get('order') || ''
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState(orderId)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return
      if (!isSupabaseConfigured || !supabase) {
        setOrder({ id: orderId, status: 'processing', total: 299, shipping_address: 'Demo tracking order' })
        setItems([])
        return
      }
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
      const { data: itemRows } = await supabase.from('order_items').select('*, products(name, image_url)').eq('order_id', orderId)
      setOrder(data || null)
      setItems(itemRows || [])
    }
    fetchOrder()
  }, [orderId])

  const statuses = ['confirmed', 'processing', 'shipped', 'delivered']
  const activeIndex = Math.max(statuses.indexOf(order?.status || 'processing'), 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-screen-2xl mx-auto px-6 pt-20 pb-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">Shipment Protocol Alpha-9</div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">TRACKING_ID: #{orderId || 'OF-9942-X'}</h1>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (query.trim()) setSearchParams({ order: query.trim() })
            }}
            className="flex gap-3"
          >
            <input className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600" placeholder="Enter order ID" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button className="bg-white text-black px-5 py-3 rounded-lg font-semibold">Track</button>
          </form>
        </div>

        <section className="mb-12">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-10 overflow-x-auto">
            <div className="min-w-[800px] flex justify-between relative">
              <div className="absolute top-5 left-0 w-full h-[2px] bg-[#222]" />
              <div className="absolute top-5 left-0 h-[2px] bg-white" style={{ width: `${(activeIndex / (statuses.length - 1)) * 100}%` }} />
              {statuses.map((step, index) => (
                <div key={step} className={`relative z-10 flex flex-col items-center gap-4 ${index > activeIndex ? 'opacity-40' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${index <= activeIndex ? 'bg-white text-black' : 'bg-[#1b1b1b] border border-[#444]'}`}>{index + 1}</div>
                  <div className={`font-mono text-[10px] uppercase tracking-widest ${index <= activeIndex ? 'text-white' : 'text-zinc-500'}`}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#0e0e0e] rounded-xl border border-white/10 overflow-hidden aspect-video relative group">
              <img className="w-full h-full object-cover grayscale opacity-40 mix-blend-luminosity scale-105 group-hover:scale-100 transition-transform duration-[2s]" alt="Shipment Path Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjHdkJeNTavzJUYJvQ6n-D55Ok1-JiIFWsnq1q2oL8_bqi35MjpPD9Snzg6y7Vepcki6yoZ1QJfaR6lLO4NeD-eSQrnQAdlU064z2hongwOnmJguQoXNzq6O3TWq4-WFNwn3SZsiXdoEfQjlLU0Ch2beK338YAQnglo0-ZF1XVKoj5fb-7qohq3DDOKqnINKm9bIvlZQ9pOc4t-h8expFRrBsDER4EQJoyRHKtbVIqcfiXjorN2guZ5RC3sXFsYmrLu48oE3Pd86o" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-8 font-mono text-sm">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="uppercase tracking-widest text-xs text-zinc-400">Live System Log</span>
                </div>
                <span className="text-white/40 text-[10px]">AUTH_LEVEL: OVERRIDE</span>
              </div>
              <div className="space-y-4">
                {[
                  'Quality assurance certification complete. All nodes operating at 100% capacity.',
                  'Product transferred to Assembly Phase 4 (Final Integration).',
                  'Core logic components initialized and verified.',
                  'Material requisition approved. Obsidian block carved.',
                ].map((line) => (
                  <div key={line} className="flex gap-6">
                    <span className="text-white/30 whitespace-nowrap">{new Date().toLocaleDateString()}</span>
                    <span className="text-white">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#111] border border-white/10 rounded-xl p-8 sticky top-24">
              <h3 className="text-[34px] leading-none font-bold mb-8 tracking-[-0.04em]">SHIPMENT_MANIFEST</h3>
              <div className="space-y-4 text-sm text-zinc-400">
                <div className="flex justify-between"><span>Status</span><span className="text-white uppercase">{order?.status || 'processing'}</span></div>
                <div className="flex justify-between"><span>Total</span><span className="text-white">${Number(order?.total || 0).toFixed(2)}</span></div>
                <div>
                  <span className="text-zinc-500">Address</span>
                  <p className="text-white mt-1 break-words leading-6">{order?.shipping_address || 'Tracking address will appear here.'}</p>
                </div>
              </div>
              {items.length ? (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-5">Items in Shipment</p>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                        <AdaptiveImage className="w-12 h-12 rounded-lg object-cover bg-[#111]" src={item.products?.image_url} alt={item.products?.name || 'Catalog item'} fallbackLabel={item.products?.name || 'Catalog item'} />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium leading-5 break-words">{item.products?.name || 'Catalog item'}</p>
                          <p className="text-zinc-500 text-xs mt-1">Qty {item.quantity}</p>
                        </div>
                        <span className="text-xs text-zinc-500 font-mono whitespace-nowrap">${Number(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">Items in Shipment</p>
                  <p className="text-sm text-zinc-500 leading-6">Manifest items will appear here as soon as the order payload is synced into tracking.</p>
                </div>
              )}
              <Link to="/dashboard" className="block w-full mt-8 bg-white text-black py-4 font-bold text-sm rounded-lg text-center hover:bg-neutral-200">
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
