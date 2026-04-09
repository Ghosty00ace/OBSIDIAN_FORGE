export const WEBSITE_CONTEXT = `
You are the Obsidian Forge website assistant for this ecommerce storefront.

You must only answer questions about this website and its directly related topics:
- products and shopping
- orders and shipment tracking
- billing and saved payment methods
- account access, profile settings, and dashboard pages
- support articles and support contact flows

Website facts you can rely on:
- Brand: Obsidian Forge.
- Main public areas: home, products marketplace, product detail, cart, checkout, support hub, login, signup, forgot password, and reset password.
- Protected customer areas after sign-in: cart, checkout, order tracking, dashboard, profile, wishlist, settings, billing, and tracking hub.
- Support topics highlighted on the site include hardware calibration, order status, forge software, security protocols, and community credits.
- Example support protocols include optimizing thermal management, tracking a shipment, and restoring companion access.
- The storefront messaging focuses on premium hardware, displays, audio, accessories, software, and high-performance components.
- If account context is provided, you may summarize the signed-in user's wishlist, purchase history, billing summary, and latest tracking phase using only that provided context.

Behavior rules:
- Be warm and conversational for simple social messages like "hi", "hello", "good morning", "good evening", "thanks", and "thank you".
- If the user sends only a greeting or thanks, reply naturally without forcing a product or support pitch.
- You may say good morning, good afternoon, or good evening when appropriate to the user's message or provided local time context.
- For casual greetings, keep the tone friendly and concise, then offer help with the website if appropriate.
- Only discuss purchase history, wishlist contents, billing totals, or tracking phases when account context is explicitly provided for a signed-in user.
- If the user asks for purchases, wishlist, billing, or tracking summaries without account context, clearly say sign-in or synced account data is required.
- If the user asks about anything outside this website, politely refuse and say you can only help with the Obsidian Forge website and storefront experience.
- Do not invent policies, pricing, shipping times, account data, or order-specific facts not provided by the website context or the current user message.
- If a question needs account-specific or live data you do not have, say that clearly and suggest the most relevant on-site page.
- Keep responses concise, helpful, and action-oriented.
- When useful, suggest one relevant destination from this list: /products, /support, /order-tracking, /dashboard/billing, /dashboard/settings, /login.
`.trim()

function getTimeOfDayLabel(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function isGreetingOnly(value) {
  return /^(hi|hello|hey|yo|good morning|good afternoon|good evening|good night|hola|namaste)\b[\s!.?,]*$/i.test(value)
}

function isThanksOnly(value) {
  return /^(thanks|thank you|thx|tysm|thanks a lot|thankyou)\b[\s!.?,]*$/i.test(value)
}

export function inferChatAction(text, user) {
  const value = String(text || '').toLowerCase()

  if (value.includes('track') || value.includes('order') || value.includes('shipping') || value.includes('shipment')) {
    return user ? { label: 'Open Tracking', route: '/order-tracking' } : { label: 'Sign In', route: '/login' }
  }

  if (value.includes('bill') || value.includes('invoice') || value.includes('payment')) {
    return user ? { label: 'Open Billing', route: '/dashboard/billing' } : { label: 'Open Support', route: '/support' }
  }

  if (value.includes('product') || value.includes('shop') || value.includes('catalog') || value.includes('recommend')) {
    return { label: user ? 'Open Marketplace' : 'Sign In to Shop', route: user ? '/products' : '/login' }
  }

  if (value.includes('support') || value.includes('help') || value.includes('issue')) {
    return { label: 'Open Support Hub', route: '/support' }
  }

  if (value.includes('setting') || value.includes('profile') || value.includes('account')) {
    return user ? { label: 'Open Settings', route: '/dashboard/settings' } : { label: 'Sign In', route: '/login' }
  }

  return null
}

export function getFallbackReply(text, user, accountContext = null) {
  const clean = String(text || '').trim()
  const value = clean.toLowerCase()
  const timeOfDay = getTimeOfDayLabel()

  if (isGreetingOnly(clean)) {
    return {
      content: `Good ${timeOfDay}. I'm here to help with the Obsidian Forge website, including products, orders, billing, and support.`,
      action: user ? { label: 'Browse Products', route: '/products' } : { label: 'Open Support', route: '/support' },
    }
  }

  if (isThanksOnly(clean)) {
    return {
      content: `You're welcome. If you need anything else on the Obsidian Forge website, I'm here to help.`,
      action: null,
    }
  }

  if ((value.includes('purchase') || value.includes('summary') || value.includes('bought') || value.includes('billing')) && accountContext?.signedIn && accountContext?.hasPurchases) {
    return {
      content: `You have ${accountContext.orderCount} order${accountContext.orderCount === 1 ? '' : 's'} on this account with total spend of ${accountContext.totalSpentLabel}. Your latest order is ${accountContext.latestOrder?.shortId || 'unavailable'} and is currently ${accountContext.latestOrder?.trackingPhase || 'in progress'}.`,
      action: { label: 'Open Billing', route: '/dashboard/billing' },
    }
  }

  if ((value.includes('wishlist') || value.includes('saved')) && accountContext?.signedIn) {
    return {
      content: accountContext.wishlistCount
        ? `You currently have ${accountContext.wishlistCount} item${accountContext.wishlistCount === 1 ? '' : 's'} in your wishlist. ${accountContext.wishlistItems.slice(0, 3).map((item) => item.name || item).join(', ')}.`
        : 'Your wishlist is currently empty.',
      action: { label: 'Open Wishlist', route: '/dashboard/wishlist' },
    }
  }

  if ((value.includes('track') || value.includes('order status') || value.includes('shipment') || value.includes('phase')) && accountContext?.signedIn && accountContext?.latestOrder) {
    return {
      content: `Your latest tracked order is ${accountContext.latestOrder.shortId}. It is currently in ${accountContext.latestOrder.trackingPhase} with status ${accountContext.latestOrder.status}.`,
      action: { label: 'Open Tracking', route: '/order-tracking' },
    }
  }

  if ((value.includes('purchase') || value.includes('wishlist') || value.includes('track') || value.includes('order') || value.includes('billing')) && !accountContext?.signedIn) {
    return {
      content: 'I can summarize purchases, wishlist items, billing history, and tracking status once you are signed in and account data is available.',
      action: { label: 'Sign In', route: '/login' },
    }
  }

  const action = inferChatAction(text, user)

  if (action?.route === '/order-tracking') {
    return {
      content: user
        ? 'You can use the order tracking area to review shipment progress and the latest dispatch updates for your account.'
        : 'Order tracking is available after sign-in so the storefront can securely match shipments to your account.',
      action,
    }
  }

  if (action?.route === '/dashboard/billing') {
    return {
      content: user
        ? 'Billing history, payment methods, and invoice-related tools are available from your billing dashboard.'
        : 'Billing help is tied to customer accounts, so sign in first or use the support hub for general purchase guidance.',
      action,
    }
  }

  if (action?.route === '/products') {
    return {
      content: 'The marketplace focuses on premium hardware, displays, audio, accessories, and related software. I can send you straight to the catalog.',
      action,
    }
  }

  if (action?.route === '/support') {
    return {
      content: 'The support hub covers hardware calibration, order status, forge software, security protocols, and direct assistance flows.',
      action,
    }
  }

  if (action?.route === '/dashboard/settings' || action?.route === '/login') {
    return {
      content: 'I can help with account access, profile settings, billing, orders, products, and support pages across the Obsidian Forge website.',
      action,
    }
  }

  return {
    content: 'I can help only with the Obsidian Forge website, including products, orders, billing, account pages, and support.',
    action: user ? { label: 'Browse Products', route: '/products' } : { label: 'Open Support', route: '/support' },
  }
}

export async function getChatbotReply(message, { user, history = [], accountContext = null } = {}) {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: String(message || ''),
      isAuthenticated: Boolean(user),
      clientTimeOfDay: getTimeOfDayLabel(),
      history: Array.isArray(history) ? history : [],
      accountContext,
    }),
  })

  if (!response.ok) {
    throw new Error(`Chatbot request failed with status ${response.status}`)
  }

  const data = await response.json()
  const content = String(data?.content || '').trim()

  if (!content) {
    return getFallbackReply(message, user)
  }

  return {
    content,
    action: inferChatAction(`${message}\n${content}`, user),
  }
}
