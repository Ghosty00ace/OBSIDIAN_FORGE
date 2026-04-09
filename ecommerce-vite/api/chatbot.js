const GEMINI_MODEL = 'gemini-2.5-flash'

const WEBSITE_CONTEXT = `
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

function extractTextFromCandidate(candidate) {
  const parts = candidate?.content?.parts ?? []
  return parts
    .map((part) => part?.text ?? '')
    .join('')
    .trim()
}

function normalizeHistoryItem(item) {
  const role = item?.role === 'assistant' ? 'model' : 'user'
  const content = String(item?.content || '').trim()

  if (!content) {
    return null
  }

  return {
    role,
    parts: [{ text: content }],
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  const message = String(req.body?.message || '').trim()
  const clientTimeOfDay = String(req.body?.clientTimeOfDay || '').trim()
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8).map(normalizeHistoryItem).filter(Boolean) : []
  const accountContext = req.body?.accountContext && typeof req.body.accountContext === 'object' ? req.body.accountContext : null

  if (!apiKey) {
    return res.status(503).json({ error: 'Gemini API key is not configured.' })
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `${WEBSITE_CONTEXT}${accountContext ? `\n\nAccount context:\n${JSON.stringify(accountContext, null, 2)}` : '\n\nNo signed-in account context is available for this request.'}`,
              },
            ],
          },
          contents: [
            ...history,
            {
              role: 'user',
              parts: [
                {
                  text: clientTimeOfDay
                    ? `User local time of day: ${clientTimeOfDay}.\nUser message: ${message}`
                    : message,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 220,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ error: errorText || 'Gemini request failed.' })
    }

    const data = await response.json()
    const content = extractTextFromCandidate(data?.candidates?.[0])

    if (!content) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' })
    }

    return res.status(200).json({ content })
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unable to reach Gemini.' })
  }
}
