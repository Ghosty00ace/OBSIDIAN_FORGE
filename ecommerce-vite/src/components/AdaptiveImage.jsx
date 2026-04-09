import { useState } from 'react'

export default function AdaptiveImage({ src, alt, className = '', fallbackLabel = 'Obsidian Forge' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,#1b1b1b,#090909)] flex items-end ${className}`}>
        <div className="p-4">
          <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-mono">Forge Visual</span>
          <p className="text-sm font-semibold text-white mt-2">{fallbackLabel}</p>
        </div>
      </div>
    )
  }

  return <img alt={alt} className={className} onError={() => setFailed(true)} src={src} />
}
