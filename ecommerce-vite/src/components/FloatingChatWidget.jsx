import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChatbotReply, getFallbackReply } from '../lib/chatbot'
import { useWishlistStore } from '../store/wishlistStore'
import { usePaymentStore } from '../store/paymentStore'
import { buildChatbotAccountContext } from '../lib/chatbotAccountContext'

const quickActions = [
  { label: 'Shop Products', prompt: 'Show me premium hardware recommendations.', route: '/products', protected: true },
  { label: 'Track Orders', prompt: 'Help me track my latest order.', route: '/order-tracking', protected: true },
  { label: 'Billing Help', prompt: 'I need billing and invoice support.', route: '/dashboard/billing', protected: true },
  { label: 'Support Hub', prompt: 'Open the full support hub.', route: '/support', protected: false },
]

const MAX_HISTORY_MESSAGES = 8

export default function FloatingChatWidget() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { items: wishlist } = useWishlistStore()
  const { methods: paymentMethods } = usePaymentStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [accountContext, setAccountContext] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 'oracle-intro',
      sender: 'assistant',
      label: 'Forge_Oracle',
      content: 'Interface initialized. I can help with products, orders, billing, support, and account pages across the Obsidian Forge website.',
    },
  ])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadAccountContext() {
      try {
        const nextContext = await buildChatbotAccountContext({ user, wishlist, paymentMethods })
        if (!ignore) {
          setAccountContext(nextContext)
        }
      } catch {
        if (!ignore) {
          setAccountContext(null)
        }
      }
    }

    void loadAccountContext()

    return () => {
      ignore = true
    }
  }, [user, wishlist, paymentMethods])

  const currentTime = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [open]
  )

  const chatHistory = useMemo(
    () =>
      messages
        .filter((message) => message.id !== 'oracle-intro')
        .slice(-MAX_HISTORY_MESSAGES)
        .map((message) => ({
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.content,
        })),
    [messages]
  )

  const sendMessage = async (text) => {
    const clean = text.trim()
    if (!clean || isSending) return

    const baseId = Date.now()
    setMessages((current) => [
      ...current,
      { id: `user-${baseId}`, sender: 'user', label: user ? 'Forge_Member' : 'Guest', content: clean },
    ])
    setInput('')

    try {
      setIsSending(true)
      const reply = await getChatbotReply(clean, { user, history: chatHistory, accountContext })
      setMessages((current) => [
        ...current,
        { id: `assistant-${baseId + 1}`, sender: 'assistant', label: 'Forge_Oracle', content: reply.content, action: reply.action },
      ])
    } catch (error) {
      const fallback = getFallbackReply(clean, user, accountContext)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${baseId + 1}`,
          sender: 'assistant',
          label: 'Forge_Oracle',
          content: `${fallback.content} Live AI response is temporarily unavailable.`,
          action: fallback.action,
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 z-[95]">
        <div
          className={`absolute bottom-20 right-0 flex w-[min(390px,calc(100vw-1rem))] sm:w-[min(390px,calc(100vw-2rem))] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_25px_60px_rgba(0,0,0,0.55)] transition-all duration-300 origin-bottom-right ${
            open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-6 scale-95 opacity-0'
          }`}
          style={{ maxHeight: 'min(76vh, 720px)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#050505]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <div>
                <h4 className="font-mono text-[10px] font-bold tracking-[0.26em] text-white uppercase">Forge Oracle Terminal</h4>
                <p className="font-mono text-[10px] text-zinc-600 mt-1">Connection established: {currentTime}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-zinc-500 hover:text-white transition-colors" onClick={() => setOpen(false)}>
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto p-5 space-y-5 bg-[#000000] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="rounded-xl border border-white/10 bg-[#101010] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      void sendMessage(action.prompt)
                      navigate(action.protected && !user ? '/login' : action.route)
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white hover:text-black transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col gap-2 max-w-[90%] ${message.sender === 'user' ? 'ml-auto items-end' : ''}`}>
                <span className="font-mono text-[10px] text-zinc-500 uppercase">{message.label}</span>
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm leading-7 ${
                    message.sender === 'user'
                      ? 'rounded-tr-none border-white bg-white text-black'
                      : 'rounded-tl-none border-white/10 bg-[#171717] text-zinc-100'
                  }`}
                >
                  <p>{message.content}</p>
                  {message.action ? (
                    <button
                      onClick={() => navigate(message.action.route)}
                      className={`mt-4 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        message.sender === 'user' ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      {message.action.label}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex items-center gap-1 px-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : null}
          </div>

          <div className="sticky bottom-0 border-t border-white/10 bg-[#050505]/96 backdrop-blur-xl p-4 sm:p-5">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void sendMessage(input)
              }}
              className="relative flex items-end gap-3 rounded-[22px] border border-white/10 bg-[#141414] px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors focus-within:border-white/20"
            >
              <span className="mb-2 ml-1 shrink-0 font-mono text-zinc-500">$</span>
              <textarea
                rows={1}
                className="max-h-32 min-h-[28px] w-full resize-none bg-transparent py-1 text-sm leading-6 text-white focus:outline-none placeholder:text-zinc-600 transition-all"
                placeholder="Ask about this website, products, orders, billing, or support..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onInput={(event) => {
                  event.currentTarget.style.height = '0px'
                  event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    if (input.trim()) {
                      void sendMessage(input)
                    }
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-600"
              >
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
            <div className="mt-4 flex justify-between px-1">
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate('/support')} className="text-[10px] font-mono text-zinc-600 hover:text-white transition-colors">/support</button>
                <button type="button" onClick={() => navigate(user ? '/products' : '/login')} className="text-[10px] font-mono text-zinc-600 hover:text-white transition-colors">/catalog</button>
              </div>
              <span className="text-[10px] font-mono text-zinc-700">WEBSITE-SCOPED AI</span>
            </div>
          </div>
        </div>

        <button
          className="relative h-14 w-14 rounded-full border border-white/10 bg-black flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 group"
          title="Forge Oracle"
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={`material-symbols-outlined text-white text-2xl transition-all duration-300 ${open ? 'rotate-45 scale-95' : 'scale-100'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {open ? 'close' : 'bolt'}
          </span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 blur-xl transition-opacity" />
        </button>
      </div>
    </>
  )
}
