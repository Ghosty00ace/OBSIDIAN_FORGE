export function normalizeProduct(product) {
  return {
    ...product,
    id: String(product.id),
    price: Number(product.price || 0),
    rating: Number(product.rating || 4.5),
    stock: Number(product.stock ?? 0),
    category: normalizeCategory(product.category),
    image_url: product.image_url || '',
    description: product.description || 'Built for precision and sustained performance.',
    sku: product.sku || `SKU-${String(product.id).slice(0, 8).toUpperCase()}`,
    specs: product.specs || {},
  }
}

export function normalizeCategory(category) {
  const value = String(category || '').trim()
  if (!value) return 'Hardware Systems'

  const map = {
    Hardware: 'Hardware Systems',
    Peripherals: 'Accessories',
    Monitors: 'Displays',
    Audio: 'Audio',
    Software: 'Software',
    Processors: 'Processors',
    'Memory Modules': 'Memory Modules',
    'Neural Units': 'Neural Units',
    'Storage Blades': 'Storage Blades',
  }

  return map[value] || value
}

export function mergeCatalogProducts(primary = [], fallback = []) {
  const seen = new Set()
  return [...primary, ...fallback]
    .map(normalizeProduct)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function getCategoryList(products = []) {
  return ['All', ...Array.from(new Set(products.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))]
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))
}
