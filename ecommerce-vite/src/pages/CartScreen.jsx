import { Link, useNavigate } from 'react-router-dom'
import StorefrontShell from '../components/StorefrontShell'
import AdaptiveImage from '../components/AdaptiveImage'
import { useCartStore } from '../store/cartStore'

export default function CartScreen() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity } = useCartStore()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!items.length) {
    return (
      <StorefrontShell active="market">
        <div className="min-h-[72vh] flex flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Cart</p>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Your cart is empty</h1>
          <p className="text-zinc-500 mb-8 max-w-lg">Start with the live marketplace, add a few products, and your checkout summary will appear here.</p>
          <Link to="/products" className="bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-neutral-200 transition-all">
            Browse Marketplace
          </Link>
        </div>
      </StorefrontShell>
    )
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const shipping = subtotal > 1200 ? 0 : 24
  const tax = subtotal * 0.08
  const grandTotal = subtotal + shipping + tax

  return (
    <StorefrontShell active="market">
      <main className="pt-20 pb-24 px-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Cart</p>
            <h1 className="text-5xl font-bold tracking-tight mb-3">Assembly Queue</h1>
            <p className="text-zinc-500">Review {count} selected units before moving into checkout.</p>
          </div>
          <Link to="/products" className="text-zinc-400 hover:text-white">Continue shopping</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <section className="lg:col-span-7 space-y-5">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-44 h-52 md:h-36 rounded-xl overflow-hidden bg-[#111] flex-shrink-0">
                  <AdaptiveImage className="w-full h-full object-cover" src={item.image_url} alt={item.name} fallbackLabel={item.name} />
                </div>
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{item.name}</h2>
                      <p className="text-zinc-500 mt-2 max-w-xl">Premium Obsidian Forge hardware configured for long-session performance and clean workstation aesthetics.</p>
                    </div>
                    <span className="font-mono text-xl text-white">${Number(item.price).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 rounded-lg border border-white/10 hover:bg-white/5">-</button>
                    <span className="min-w-12 text-center font-mono">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 rounded-lg border border-white/10 hover:bg-white/5">+</button>
                    <button type="button" onClick={() => removeItem(item.id)} className="ml-2 text-zinc-500 hover:text-white">Remove</button>
                    <span className="ml-auto text-zinc-400">Line total <span className="text-white font-mono ml-2">${Number(item.price * item.quantity).toFixed(2)}</span></span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 sticky top-24">
              <h2 className="text-3xl font-bold tracking-tight mb-8">Cart Summary</h2>
              <div className="space-y-4 text-zinc-400 border-b border-white/10 pb-6 mb-6">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="font-mono">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span>Estimated Tax</span><span className="font-mono">${tax.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between text-white text-2xl font-bold mb-8">
                <span>Total</span>
                <span className="font-mono">${grandTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-all">
                Proceed to Checkout
              </button>
              <p className="mt-5 text-center text-[10px] uppercase tracking-[0.28em] text-zinc-600">Secure cart state synced locally</p>
            </div>
          </aside>
        </div>
      </main>
    </StorefrontShell>
  )
}
