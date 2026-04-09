import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StorefrontShell from '../components/StorefrontShell'
import AdaptiveImage from '../components/AdaptiveImage'
import { useCartStore } from '../store/cartStore'
import { usePaymentStore } from '../store/paymentStore'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import Toast from '../components/Toast'
import { isUuid } from '../lib/catalog'

export default function CheckoutScreen() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [saveCard, setSaveCard] = useState(true)
  const [offerCode, setOfferCode] = useState('')
  const [appliedOffer, setAppliedOffer] = useState('')
  const { methods, addCard, addWallet } = usePaymentStore()
  const defaultMethod = methods.find((item) => item.isDefault) || null
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  })

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items])
  const shipping = useMemo(() => (subtotal > 1200 ? 0 : 24), [subtotal])
  const tax = useMemo(() => subtotal * 0.08, [subtotal])
  const discount = useMemo(() => {
    if (appliedOffer === 'FORGE10') return Math.min(subtotal * 0.1, 120)
    if (appliedOffer === 'WELCOME25') return Math.min(25, subtotal)
    return 0
  }, [appliedOffer, subtotal])
  const grandTotal = useMemo(() => Math.max(0, subtotal + shipping + tax - discount), [subtotal, shipping, tax, discount])
  const forgePointsEarned = useMemo(() => Math.floor(grandTotal / 5), [grandTotal])

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleOrder = async (event) => {
    event.preventDefault()
    if (!items.length) return
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase is not configured yet.')
      }

      const unsupportedItems = items.filter((item) => !isUuid(item.id))
      if (unsupportedItems.length > 0) {
        throw new Error('Some showcase items are not in the live catalog yet. Please order products from the synced marketplace items.')
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: grandTotal,
          status: 'confirmed',
          shipping_address: `${form.address}, ${form.city} ${form.zip}`,
        })
        .select()
        .single()

      if (error) throw error

      const { error: itemError } = await supabase.from('order_items').insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        }))
      )
      if (itemError) throw itemError

      if (paymentMethod === 'card' && saveCard && form.cardNumber.trim()) {
        addCard(form.cardNumber, 'Visa')
      }
      if (paymentMethod === 'wallet' && !methods.some((item) => item.type === 'wallet' && item.label === 'Digital Wallet')) {
        addWallet('Digital Wallet')
      }

      clearCart()
      navigate(`/order-confirmation?order=${order.id}&payment=${paymentMethod}`)
    } catch (error) {
      setToast({ message: error.message || 'Unable to place order.', type: 'error' })
    }
    setLoading(false)
  }

  const applyOffer = () => {
    const normalized = offerCode.trim().toUpperCase()
    if (normalized === 'FORGE10' || normalized === 'WELCOME25') {
      setAppliedOffer(normalized)
      setToast({ message: `${normalized} applied successfully.`, type: 'success' })
      return
    }
    setAppliedOffer('')
    setToast({ message: 'Invalid offer code.', type: 'error' })
  }

  if (!items.length && !loading) {
    return (
      <StorefrontShell active="market">
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Cart is empty</h1>
          <p className="text-zinc-500 mb-8">Add products from the marketplace before checkout.</p>
          <Link to="/products" className="bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-neutral-200 transition-all">
            Browse Market
          </Link>
        </div>
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell active="market">
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <main className="pt-20 pb-24 px-6 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <form className="lg:col-span-7 space-y-12" onSubmit={handleOrder}>
            <section>
              <h1 className="text-5xl font-bold tracking-tight mb-8">Shipping Details</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="John" value={form.firstName} onChange={setField('firstName')} required />
                <input className="bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="Doe" value={form.lastName} onChange={setField('lastName')} required />
                <input className="md:col-span-2 bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="One Infinity Loop" value={form.address} onChange={setField('address')} required />
                <input className="bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="Cupertino" value={form.city} onChange={setField('city')} required />
                <input className="bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="95014" value={form.zip} onChange={setField('zip')} required />
              </div>
            </section>

            <section>
              <h2 className="text-4xl font-bold tracking-tight mb-6">Payment Method</h2>
              <div className="space-y-4">
                <button type="button" className={`w-full flex items-center justify-between px-5 py-4 rounded-lg border ${paymentMethod === 'card' ? 'border-white bg-white/5' : 'border-white/10'}`} onClick={() => setPaymentMethod('card')}>
                  <span className="flex items-center gap-3"><span className="material-symbols-outlined">credit_card</span> Credit / Debit Card</span>
                  <span className={`w-4 h-4 rounded-full border ${paymentMethod === 'card' ? 'border-white bg-white' : 'border-white/20'}`} />
                </button>
                <button type="button" className={`w-full flex items-center justify-between px-5 py-4 rounded-lg border ${paymentMethod === 'wallet' ? 'border-white bg-white/5' : 'border-white/10'}`} onClick={() => setPaymentMethod('wallet')}>
                  <span className="flex items-center gap-3"><span className="material-symbols-outlined">account_balance_wallet</span> Digital Wallet</span>
                  <span className={`w-4 h-4 rounded-full border ${paymentMethod === 'wallet' ? 'border-white bg-white' : 'border-white/20'}`} />
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="mt-6 rounded-xl border border-white/10 bg-[#0f0f0f] p-6 space-y-4">
                  {defaultMethod ? (
                    <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{defaultMethod.label}</p>
                        <p className="text-zinc-500 text-sm">Saved payment detail</p>
                      </div>
                      <button type="button" className="text-sm text-zinc-400 hover:text-white" onClick={() => {
                        setForm((current) => ({
                          ...current,
                          cardNumber: current.cardNumber || '4242 4242 4242 4242',
                          expiry: current.expiry || '12 / 28',
                          cvc: current.cvc || '123',
                        }))
                      }}>
                        Use
                      </button>
                    </div>
                  ) : null}
                  <input className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={setField('cardNumber')} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="MM / YY" value={form.expiry} onChange={setField('expiry')} />
                    <input className="bg-transparent border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-zinc-700" placeholder="123" value={form.cvc} onChange={setField('cvc')} />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input checked={saveCard} className="h-4 w-4 border-white/20 bg-transparent text-white focus:ring-0" onChange={() => setSaveCard((value) => !value)} type="checkbox" />
                    <span className="text-sm text-zinc-300">Save this card in payment details</span>
                  </label>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-white/10 bg-[#0f0f0f] p-6 text-zinc-500">
                  Digital wallet mode is enabled. Continue to place the order and the wallet method will appear in billing.
                </div>
              )}
            </section>
          </form>

          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Order Summary</h2>
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">{items.length} items</span>
              </div>
              <div className="space-y-5 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <AdaptiveImage className="w-20 h-20 rounded-lg object-cover bg-[#111]" src={item.image_url} alt={item.name} fallbackLabel={item.name} />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-zinc-500 text-sm">Qty {item.quantity} - ${Number(item.price).toFixed(2)} each</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded border border-white/10 hover:bg-white/5">-</button>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded border border-white/10 hover:bg-white/5">+</button>
                        <button type="button" onClick={() => removeItem(item.id)} className="text-zinc-500 hover:text-white text-sm">Remove</button>
                      </div>
                    </div>
                    <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-zinc-400 border-t border-white/10 pt-6">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Standard Shipping</span><span className="font-mono">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span>Estimated Tax</span><span className="font-mono">${tax.toFixed(2)}</span></div>
                {discount > 0 ? <div className="flex justify-between text-emerald-300"><span>Forge Discount</span><span className="font-mono">-${discount.toFixed(2)}</span></div> : null}
                <div className="flex justify-between text-white text-2xl font-bold pt-3">
                  <span>Total</span><span className="font-mono">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Forge Points</p>
                    <p className="text-zinc-300 text-sm mt-2">Earn {forgePointsEarned} points with this purchase.</p>
                  </div>
                  <span className="text-white font-mono text-lg">+{forgePointsEarned}</span>
                </div>
                <div className="space-y-3">
                  <input value={offerCode} onChange={(event) => setOfferCode(event.target.value)} className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-700" placeholder="Offer code: FORGE10" />
                  <button type="button" onClick={applyOffer} className="w-full border border-white/15 py-3 rounded-lg hover:bg-white/5 transition-colors">
                    Apply Offer
                  </button>
                  <div className="text-xs text-zinc-500 leading-6">
                    Available offers: `FORGE10` for 10% off, `WELCOME25` for $25 off.
                  </div>
                </div>
              </div>

              <button onClick={handleOrder} disabled={loading} className="w-full mt-8 bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-50">
                {loading ? 'Completing Purchase...' : 'Complete Purchase'}
              </button>
              <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest mt-5">Encrypted 256-bit SSL transaction</p>
            </div>
          </aside>
        </div>
      </main>
    </StorefrontShell>
  )
}
