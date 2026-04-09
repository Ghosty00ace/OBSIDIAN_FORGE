import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StorefrontShell from '../components/StorefrontShell'
import Toast from '../components/Toast'
import { stitchCatalog } from '../lib/stitchCatalog'

const supportTiles = [
  {
    key: 'care',
    title: 'Hardware Calibration',
    subtitle: 'Tune keyboard acoustics, panel profiles, and thermal behavior across the forge lineup.',
    icon: 'tune',
    span: 'md:col-span-2 min-h-[280px]',
  },
  {
    key: 'orders',
    title: 'Order Status',
    subtitle: 'TRACK_MANIFEST_V2',
    icon: 'local_shipping',
    span: 'min-h-[280px]',
  },
  {
    key: 'software',
    title: 'Forge Software',
    subtitle: 'COMPANION_STACK_STABLE',
    icon: 'deployed_code',
    span: 'min-h-[280px]',
  },
  {
    key: 'security',
    title: 'Security Protocols',
    subtitle: 'Account recovery, password rotation, and safe billing verification flows.',
    icon: 'shield_lock',
    span: 'md:col-span-2 min-h-[210px]',
  },
  {
    key: 'community',
    title: 'Community Credits',
    subtitle: 'HAPPY_FORGERS // CREW_NOTES',
    icon: 'diversity_3',
    span: 'md:col-span-2 min-h-[210px]',
  },
]

const supportArticles = [
  {
    id: 'PROTO_ID: 992-X',
    title: 'Optimizing Carbon-X Thermal Management',
    body: 'A deep dive into heat dissipation, airflow balancing, and desk-safe thermal practices for high-frequency forge setups.',
  },
  {
    id: 'PROTO_ID: 401-A',
    title: 'Tracking a Shipment Through the Forge',
    body: 'Follow confirmation, processing, and manifest handoff steps while a premium hardware order moves through dispatch.',
  },
  {
    id: 'PROTO_ID: 112-Q',
    title: 'Restoring Forge Companion Access',
    body: 'Recover profiles, companion settings, and account control when a workstation is re-imaged or transferred.',
  },
]

export default function SupportScreen() {
  const [selectedTopic, setSelectedTopic] = useState('care')
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('Low')
  const [assetId, setAssetId] = useState('Forge_Unit_001')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState(null)

  const filteredArticles = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) {
      return supportArticles
    }
    return supportArticles.filter((article) => `${article.title} ${article.body}`.toLowerCase().includes(value))
  }, [query])

  const suggestedProducts = useMemo(() => stitchCatalog.slice(0, 3), [])

  const handleTileSelect = (tile) => {
    setSelectedTopic(tile.key)
    setSubject(tile.title)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setToast({
      message: `Support request for ${subject || 'general assistance'} initialized. Priority ${priority.toUpperCase()} has been queued.`,
      type: 'success',
    })
    setMessage('')
  }

  return (
    <StorefrontShell active="support" showSearch={false} showSupport>
      {toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null}
      <main className="pt-28 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
        <section className="mb-24">
          <div className="max-w-4xl">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4 block">System_Node: Assistance_Protocol</span>
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
              How can we
              <br />
              assist your forge?
            </h1>
            <div className="relative group max-w-2xl">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-zinc-500">search</span>
              </div>
              <input
                className="w-full bg-transparent border border-white/10 py-5 pl-14 pr-24 rounded-xl focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-lg font-light text-white placeholder:text-zinc-600"
                placeholder="Search the Obsidian support base..."
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="absolute inset-y-2 right-2 hidden md:flex items-center pr-4">
                <kbd className="font-mono text-[10px] border border-white/10 px-2 py-1 rounded text-zinc-500 bg-black">LIVE</kbd>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {supportTiles.map((tile) => {
              const active = selectedTopic === tile.key
              return (
                <button
                  key={tile.key}
                  onClick={() => handleTileSelect(tile)}
                  className={`${tile.span} group relative overflow-hidden bg-[#191919] p-8 rounded-xl border text-left transition-all ${
                    active ? 'border-white/35 bg-[#202020]' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <span className="material-symbols-outlined text-white text-3xl">{tile.icon}</span>
                    <div className="mt-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{tile.title}</h3>
                      <p className={`leading-relaxed ${tile.subtitle === tile.subtitle.toUpperCase() ? 'text-zinc-500 text-xs font-mono tracking-[0.18em] uppercase' : 'text-zinc-400 text-sm max-w-sm'}`}>
                        {tile.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-16 mb-24 items-start">
          <aside>
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-500 mb-10">Popular Protocols</h2>
            <div className="space-y-12">
              {filteredArticles.map((article) => (
                <article key={article.id} className="group cursor-pointer">
                  <span className="text-zinc-500 font-mono text-[10px] mb-2 block">{article.id}</span>
                  <h4 className="text-xl font-medium text-white group-hover:underline underline-offset-4 decoration-white mb-2 transition-all">{article.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{article.body}</p>
                </article>
              ))}
              <Link to="/products" className="inline-flex items-center text-sm font-bold text-white uppercase tracking-widest group">
                Browse Live Catalog
                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
              </Link>
            </div>
          </aside>

          <section className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="bg-[#202020] px-6 py-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <span className="ml-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Submit_Assistance_Ticket.sh</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">v2.4.0-STABLE</span>
            </div>

            <div className="p-8 md:p-10">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-zinc-500">Subject</label>
                  <input
                    className="w-full bg-transparent border-b border-white/15 py-3 focus:outline-none focus:border-white transition-colors text-white placeholder:text-zinc-700"
                    placeholder="Brief summary of the anomaly..."
                    type="text"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase text-zinc-500">Priority_Level</label>
                    <select
                      className="w-full bg-transparent border-b border-white/15 py-3 focus:outline-none focus:border-white transition-colors text-white appearance-none cursor-pointer"
                      value={priority}
                      onChange={(event) => setPriority(event.target.value)}
                    >
                      <option className="bg-black">Low</option>
                      <option className="bg-black">High</option>
                      <option className="bg-black">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase text-zinc-500">Asset_ID</label>
                    <input
                      className="w-full bg-transparent border-b border-white/15 py-3 focus:outline-none focus:border-white transition-colors text-white placeholder:text-zinc-700"
                      placeholder="Forge_Unit_001"
                      type="text"
                      value={assetId}
                      onChange={(event) => setAssetId(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-zinc-500">Deployment_Logs</label>
                  <textarea
                    className="w-full bg-[#191919] border border-white/10 p-4 rounded-lg focus:outline-none focus:border-white transition-colors text-sm text-white placeholder:text-zinc-700 resize-none font-mono"
                    placeholder="Paste your system logs or a detailed support message here..."
                    rows="6"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">Suggested Assets</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {suggestedProducts.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setAssetId(item.sku || item.name)}
                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-left hover:border-white/25 transition-colors"
                      >
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-zinc-500 text-[11px] font-mono mt-1">{item.sku}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4">
                  <p className="text-[10px] font-mono text-zinc-500 leading-tight">
                    By submitting, you authorize temporary
                    <br />
                    diagnostic access to Forge telemetry.
                  </p>
                  <button className="bg-white text-black px-10 py-4 font-bold uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all rounded-lg" type="submit">
                    Initialize_Transfer
                  </button>
                </div>
              </form>
            </div>
          </section>
        </section>

        <section className="border-t border-white/10 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Direct Sync Protocols</h2>
              <p className="text-zinc-400 max-w-sm">When automated protocols fail, initiate direct synchronization with our high-priority support network.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full md:w-auto">
              {[
                ['chat_bubble', 'Live Link', 'Chat with Agent'],
                ['call', 'Neural Link', '+1 (800) FORGE-01'],
                ['alternate_email', 'Electronic Mail', 'support@obsidianforge.com'],
              ].map(([icon, label, value]) => (
                <button key={label} onClick={() => setToast({ message: `${value} copied to your next support step.`, type: 'info' })} className="flex flex-col items-start group text-left">
                  <span className="material-symbols-outlined text-zinc-500 group-hover:text-white transition-colors mb-4">{icon}</span>
                  <span className="font-mono text-[10px] uppercase text-zinc-500 mb-1">{label}</span>
                  <span className="text-white font-medium border-b border-white/0 group-hover:border-white transition-all">{value}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </StorefrontShell>
  )
}
