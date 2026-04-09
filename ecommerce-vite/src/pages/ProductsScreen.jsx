import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StorefrontShell from '../components/StorefrontShell'
import AdaptiveImage from '../components/AdaptiveImage'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { stitchCatalog } from '../lib/stitchCatalog'
import { getCategoryList, isUuid, mergeCatalogProducts } from '../lib/catalog'
import { useCartStore } from '../store/cartStore'

export default function ProductsScreen() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [maxPrice, setMaxPrice] = useState(5000)
  const [minRating, setMinRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [added, setAdded] = useState({})
  const { addItem, getItemQuantity } = useCartStore()
  const pageSize = 6

  useEffect(() => {
    async function fetchProducts() {
      if (!isSupabaseConfigured || !supabase) {
        const mergedFallback = mergeCatalogProducts([], stitchCatalog)
        setProducts(mergedFallback)
        setMaxPrice(Math.max(...mergedFallback.map((item) => item.price), 5000))
        setLoading(false)
        return
      }
      const { data } = await supabase.from('products').select('*').order('created_at')
      const merged = mergeCatalogProducts(data || [], stitchCatalog)
      setProducts(merged)
      setMaxPrice(Math.max(...merged.map((item) => item.price), 5000))
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const categories = getCategoryList(products)

  const handleAdd = (product) => {
    if (isSupabaseConfigured && !isUuid(product.id)) return
    addItem(product)
    setAdded((state) => ({ ...state, [product.id]: true }))
    setTimeout(() => setAdded((state) => ({ ...state, [product.id]: false })), 1200)
  }

  let filtered = products.filter((product) =>
    (category === 'All' || product.category === category) &&
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    product.price <= maxPrice &&
    product.rating >= minRating &&
    (!inStockOnly || product.stock > 0)
  )

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0))

  useEffect(() => {
    setPage(1)
  }, [category, search, sortBy, maxPrice, minRating, inStockOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage])
  const pageWindow = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages])

  return (
    <StorefrontShell active="market">
      <main className="pt-16 pb-20 px-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 pt-16">
          <aside className="w-full md:w-64 flex-shrink-0 space-y-10">
            <section>
              <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-6">Category</h3>
              <div className="space-y-3">
                {categories.map((item) => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={category === item}
                      className="h-4 w-4 border-white/20 bg-transparent text-white focus:ring-0"
                      name="category"
                      onChange={() => setCategory(item)}
                      type="radio"
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-6">Price Range</h3>
              <div className="space-y-4">
                <input type="range" min="0" max={Math.max(...products.map((item) => item.price), 5000)} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="w-full accent-white" />
                <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" readOnly value={`Up to $${maxPrice.toFixed(0)}`} />
              </div>
            </section>

            <section>
              <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-6">Minimum Rating</h3>
              <div className="space-y-3">
                {[0, 4, 4.5].map((value) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer">
                    <input checked={minRating === value} className="h-4 w-4 border-white/20 bg-transparent text-white focus:ring-0" name="rating" onChange={() => setMinRating(value)} type="radio" />
                    <span className="text-sm text-zinc-300">{value === 0 ? 'All ratings' : `${value}+ only`}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <label className="flex items-center gap-3 cursor-pointer">
                <input checked={inStockOnly} className="h-4 w-4 border-white/20 bg-transparent text-white focus:ring-0" onChange={() => setInStockOnly((value) => !value)} type="checkbox" />
                <span className="text-sm text-zinc-300">In stock only</span>
              </label>
            </section>

            <button onClick={() => { setCategory('All'); setSearch(''); setSortBy('default'); setMinRating(0); setInStockOnly(false); setMaxPrice(Math.max(...products.map((item) => item.price), 5000)); setPage(1) }} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-all">
              RESET FILTERS
            </button>
          </aside>

          <section className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div>
                <h1 className="text-5xl font-bold tracking-tight mb-3">High Performance Hardware</h1>
                <p className="text-zinc-500">Showing {filtered.length} specialized units for local computation and premium setups.</p>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search components..."
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 w-64"
                />
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Sort By</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-transparent text-white focus:outline-none">
                    <option className="bg-black" value="default">Popularity</option>
                    <option className="bg-black" value="price-asc">Price Low to High</option>
                    <option className="bg-black" value="price-desc">Price High to Low</option>
                    <option className="bg-black" value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-24 text-zinc-500">Loading products...</div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {pagedProducts.map((product) => (
                    <div key={product.id} className="group bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/30">
                      <Link to={`/product?id=${product.id}`}>
                        <div className="aspect-[4/5] overflow-hidden bg-[#151515]">
                          <AdaptiveImage className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" src={product.image_url} alt={product.name} fallbackLabel={product.name} />
                        </div>
                      </Link>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3 gap-4">
                          <div>
                            <h3 className="font-bold text-lg text-white">{product.name}</h3>
                            <p className="text-zinc-500 text-sm mt-1">{product.description || 'Built for precision and sustained performance.'}</p>
                          </div>
                          <p className="font-mono text-white whitespace-nowrap">${Number(product.price).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono text-zinc-600">
                          <span>{isSupabaseConfigured && !isUuid(product.id) ? 'SHOWCASE' : product.sku || `SKU - ${String(product.id).slice(0, 6)}`}</span>
                          <div className="flex items-center gap-4">
                            {isSupabaseConfigured && !isUuid(product.id) ? (
                              <span className="text-zinc-500">Preview</span>
                            ) : (
                              <button onClick={() => handleAdd(product)} className={`transition-colors ${added[product.id] ? 'text-white' : 'hover:text-white'}`}>
                                {added[product.id] ? 'Added' : getItemQuantity(product.id) > 0 ? `In Cart ${getItemQuantity(product.id)}` : 'Add'}
                              </button>
                            )}
                            <Link to={`/product?id=${product.id}`} className="hover:text-white">Details</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filtered.length > pageSize ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Page Catalog</p>
                      <p className="text-zinc-400 text-sm mt-2">
                        Page {currentPage} of {totalPages} showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} items.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      {pageWindow.map((value) => (
                        <button
                          key={value}
                          onClick={() => setPage(value)}
                          className={`h-10 min-w-10 px-3 rounded-lg text-sm font-medium transition-colors ${currentPage === value ? 'bg-white text-black' : 'border border-white/10 text-zinc-300 hover:bg-white/5'}`}
                        >
                          {value}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-white/10 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            {!loading && filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-10 mt-8">
                <h2 className="text-2xl font-bold mb-3">No products match these filters</h2>
                <p className="text-zinc-500 mb-6">Try expanding the price range or resetting category filters to explore the full forge catalog.</p>
                <button onClick={() => { setCategory('All'); setSearch(''); setSortBy('default'); setMinRating(0); setInStockOnly(false); setMaxPrice(Math.max(...products.map((item) => item.price), 5000)); setPage(1) }} className="bg-white text-black px-5 py-3 rounded-lg font-semibold">
                  Show all products
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </StorefrontShell>
  )
}
