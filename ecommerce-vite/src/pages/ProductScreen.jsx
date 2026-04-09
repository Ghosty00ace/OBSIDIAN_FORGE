import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StorefrontShell from '../components/StorefrontShell'
import AdaptiveImage from '../components/AdaptiveImage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { stitchCatalog } from '../lib/stitchCatalog'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import Toast from '../components/Toast'
import { isUuid } from '../lib/catalog'

export default function ProductScreen() {
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('id') || '1'
  const [product, setProduct] = useState(stitchCatalog[0])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState(null)
  const [reviews, setReviews] = useState([])
  const { addItem } = useCartStore()
  const { toggleItem, hasItem } = useWishlistStore()

  useEffect(() => {
    async function fetchProduct() {
      if (!isSupabaseConfigured || !supabase) {
        setProduct(stitchCatalog.find((item) => String(item.id) === String(productId)) || stitchCatalog[0])
        setLoading(false)
        return
      }

      const fallback = stitchCatalog.find((item) => String(item.id) === String(productId)) || stitchCatalog[0]
      const { data } = await supabase.from('products').select('*').eq('id', productId).maybeSingle()
      setProduct(data || fallback)

      const { data: reviewRows } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(4)

      setReviews(reviewRows || [])
      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  const gallery = [product.image_url, ...stitchCatalog.filter((item) => item.id !== product.id).slice(0, 4).map((item) => item.image_url)]
  const canPurchase = !isSupabaseConfigured || isUuid(product.id)
  const wished = hasItem(product.id)

  if (loading) {
    return <StorefrontShell active="market"><div className="min-h-[70vh] flex items-center justify-center text-zinc-500">Loading product...</div></StorefrontShell>
  }

  return (
    <StorefrontShell active="market">
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <main className="pt-20 pb-24 px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 text-sm text-zinc-500 mb-8">
          <Link to="/products" className="hover:text-white">Shop</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#111] border border-white/10 group">
              <AdaptiveImage className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={product.image_url} alt={product.name} fallbackLabel={product.name} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {gallery.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden bg-[#111] border border-white/10">
                  <AdaptiveImage className="w-full h-full object-cover" src={image} alt={`${product.name} detail ${index + 1}`} fallbackLabel={product.name} />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">{product.category}</p>
              <h1 className="text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-zinc-300">5 / 5</span>
                <span className="text-zinc-500 text-sm">{Number(product.rating || 4.8).toFixed(1)} rating</span>
              </div>
              <p className="text-zinc-400 leading-8 mb-8">
                {product.description || 'Built for local AI workloads, premium desktop rigs, and high-throughput precision systems.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 rounded-xl bg-[#0e0e0e] border border-white/10 p-6">
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest mb-1">{key}</p>
                    <p className="text-white font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 mb-8">
                <span className="text-4xl font-bold font-mono">${Number(product.price).toFixed(2)}</span>
                <span className="px-3 py-1 rounded-full border border-white/10 text-sm text-zinc-400">{product.stock || 24} in stock</span>
              </div>
              {!canPurchase ? (
                <div className="mb-6 rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-zinc-400">
                  This is a showcase concept from the Stitch collection. Live checkout is available for synced marketplace items.
                </div>
              ) : null}

              <div className="flex gap-3 mb-5">
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                  <button onClick={() => setQty((current) => Math.max(1, current - 1))} className="px-4 py-3 hover:bg-white/5">-</button>
                  <span className="px-4 py-3 font-mono text-sm">{qty}</span>
                  <button onClick={() => setQty((current) => Math.min(product.stock || 99, current + 1))} className="px-4 py-3 hover:bg-white/5">+</button>
                </div>
                <button
                  onClick={() => {
                    toggleItem(product)
                    setToast({ message: wished ? 'Removed from wishlist.' : 'Saved to wishlist.', type: 'info' })
                  }}
                  className={`px-5 font-bold py-3 rounded-lg border transition-all ${wished ? 'border-white bg-white text-black' : 'border-white/20 text-white hover:bg-white/5'}`}
                >
                  {wished ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button
                  onClick={() => {
                    if (!canPurchase) {
                      setToast({ message: 'This showcase item is preview-only. Browse synced marketplace items to purchase.', type: 'info' })
                      return
                    }
                    addItem(product, qty)
                    setToast({ message: `${product.name} added to cart.`, type: 'success' })
                  }}
                  className={`flex-1 font-bold py-3 rounded-lg transition-all ${canPurchase ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white/5 text-zinc-500 cursor-not-allowed'}`}
                >
                  {canPurchase ? 'Add to Cart' : 'Preview Only'}
                </button>
              </div>

              {canPurchase ? (
                <Link to="/checkout" onClick={() => addItem(product, qty)} className="block w-full text-center border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white hover:text-black transition-all">
                  Buy Now
                </Link>
              ) : (
                <Link to="/products" className="block w-full text-center border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white hover:text-black transition-all">
                  Browse Live Catalog
                </Link>
              )}
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Related Systems</h2>
              <p className="text-zinc-500">More components from the same premium stack.</p>
            </div>
            <Link to="/products" className="text-zinc-400 hover:text-white">Back to catalog</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stitchCatalog.filter((item) => item.id !== product.id).slice(0, 4).map((item) => (
              <Link key={item.id} to={`/product?id=${item.id}`} className="group bg-black border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all">
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-[#111] mb-6">
                  <AdaptiveImage className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={item.image_url} alt={item.name} fallbackLabel={item.name} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1">{item.name}</h3>
                    <p className="text-zinc-500 text-sm font-mono">${item.price.toFixed(2)}</p>
                  </div>
                  <span className="text-zinc-600 text-xs font-mono uppercase">View</span>
                </div>
              </Link>
            ))}
          </div>

          {reviews.length > 0 ? (
            <div className="mt-16">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Latest Reviews</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-white/10 bg-[#0e0e0e] p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</span>
                      <span className="text-zinc-500 text-sm">{`${review.rating || 5}/5`}</span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-7">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </StorefrontShell>
  )
}
