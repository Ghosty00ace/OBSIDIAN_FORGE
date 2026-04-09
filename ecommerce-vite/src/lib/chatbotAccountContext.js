import { supabase, isSupabaseConfigured } from './supabase'

const TRACKING_STEPS = ['confirmed', 'processing', 'shipped', 'delivered']

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function toTrackingPhase(status) {
  const normalized = String(status || '').toLowerCase()
  const index = Math.max(TRACKING_STEPS.indexOf(normalized), 0)
  return {
    status: normalized || 'confirmed',
    phaseNumber: index + 1,
    phaseLabel: TRACKING_STEPS[index],
    totalPhases: TRACKING_STEPS.length,
  }
}

function summarizeOrder(order) {
  const tracking = toTrackingPhase(order?.status)
  const items = Array.isArray(order?.order_items) ? order.order_items : []

  return {
    id: order?.id || '',
    shortId: order?.id ? order.id.slice(0, 8).toUpperCase() : 'UNKNOWN',
    createdAt: order?.created_at || null,
    total: Number(order?.total || 0),
    totalLabel: formatCurrency(order?.total || 0),
    status: tracking.status,
    trackingPhase: `${tracking.phaseLabel} (${tracking.phaseNumber}/${tracking.totalPhases})`,
    shippingAddress: order?.shipping_address || '',
    itemCount: items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0),
    items: items.slice(0, 5).map((item) => ({
      name: item?.products?.name || 'Catalog item',
      quantity: Number(item?.quantity || 0),
      totalLabel: formatCurrency(Number(item?.price_at_purchase || 0) * Number(item?.quantity || 0)),
    })),
  }
}

export async function buildChatbotAccountContext({ user, wishlist = [], paymentMethods = [] }) {
  if (!user) {
    return {
      signedIn: false,
      hasPurchases: false,
      hasWishlist: wishlist.length > 0,
      wishlistCount: wishlist.length,
      wishlistItems: wishlist.slice(0, 5).map((item) => item.name).filter(Boolean),
      paymentMethodCount: 0,
    }
  }

  const baseContext = {
    signedIn: true,
    hasPurchases: false,
    orderCount: 0,
    activeOrderCount: 0,
    totalSpent: 0,
    totalSpentLabel: formatCurrency(0),
    latestOrder: null,
    recentOrders: [],
    wishlistCount: wishlist.length,
    hasWishlist: wishlist.length > 0,
    wishlistItems: wishlist.slice(0, 5).map((item) => ({
      name: item?.name || 'Saved item',
      priceLabel: formatCurrency(item?.price || 0),
      category: item?.category || 'Saved item',
    })),
    paymentMethodCount: paymentMethods.length,
    defaultPaymentMethod: paymentMethods.find((item) => item.isDefault)?.label || null,
  }

  if (!isSupabaseConfigured || !supabase) {
    return baseContext
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(quantity, price_at_purchase, products(name, image_url))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const normalizedOrders = Array.isArray(orders) ? orders : []
  const totalSpent = normalizedOrders.reduce((sum, order) => sum + Number(order?.total || 0), 0)
  const recentOrders = normalizedOrders.map(summarizeOrder)

  return {
    ...baseContext,
    hasPurchases: normalizedOrders.length > 0,
    orderCount: normalizedOrders.length,
    activeOrderCount: normalizedOrders.filter((item) => ['confirmed', 'processing', 'shipped'].includes(String(item?.status || '').toLowerCase())).length,
    totalSpent,
    totalSpentLabel: formatCurrency(totalSpent),
    latestOrder: recentOrders[0] || null,
    recentOrders: recentOrders.slice(0, 3),
  }
}
