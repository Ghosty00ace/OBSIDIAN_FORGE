import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' }

  return (
    <div className="fixed right-4 top-20 z-[999999] w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-24">
      <div
        style={{ borderColor: colors[type] }}
        className="rounded-2xl border bg-[#101010]/95 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <div className="flex items-start gap-3">
          <div
            style={{ color: colors[type] }}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/30 bg-white/5 text-xs font-bold"
          >
            {type === 'success' ? 'OK' : type === 'error' ? '!' : 'i'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-500 mb-1">
              {type === 'success' ? 'Forge Updated' : type === 'error' ? 'Action Failed' : 'Heads Up'}
            </p>
            <p className="text-sm leading-6 text-zinc-100 break-words">{message}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
            x
          </button>
        </div>
      </div>
    </div>
  )
}
