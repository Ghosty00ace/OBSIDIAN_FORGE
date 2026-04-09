import { Link } from 'react-router-dom'
import StorefrontShell from '../components/StorefrontShell'
import AdaptiveImage from '../components/AdaptiveImage'
import { useCartStore } from '../store/cartStore'

const featuredProducts = [
  {
    id: '1',
    name: 'Key-01 Core',
    price: 249,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqaXRVCdduQxO26ax-DHMXCMKQtMHwMJcRPciTbLbA0fTL7_DpLyXB10OWBfmiFLEKIkQm4r2fnAe4jekWLl8JCV85hxYExKVyiKBGXUHrKPX1WBzEjy9wVD29C5BJ75gPufpZlKe_mul5GEV6UkBHjK5E5FuMbmnq8VUCmCalmskOyiO0THzguOeByrqagDRGR0zhdtIVScABrjMAdEmv3k5RdnNJQVjb_f9qn41OJM_Z2Up4PhQuUVE41FmWZboWQCV0VnU9nvQ',
  },
  {
    id: '4',
    name: 'Audio-P1 Pro',
    price: 399,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfkm2iSjy_78I4WLz1BKP1LCv8roU9bgEDqkbCu-KSchjfR5WXu1lhGWtu-aZahiwEppECYlg07GjvpwXBiRg0lOjJYYhKUmYm5KxNu6TijP6JCXPjhuoJlYf8kUWoh7dKD_lD4ke2p2c3CS3sXUUIkKT5B8CUL6X_d5AKYWqKjVqcpsHb6Z6bGOTgT5SNdjO9L0tU8t1PxHICz0r-3r6yK7VPpiLc_DI_2H6lPgx4wAzjHfcU_acAUhsfT_AlYoTRQ-Y7oD3PRy4',
  },
  {
    id: '2',
    name: 'ForgeBook X',
    price: 1899,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiVl8FALZEJUgTJb8crp72Ywrw1fc2WUKb0s6dOII4Wlzk0npamu4ownelCyiQoExA06gGlyR4Do-RuiWxNg6ylKX0HT5xe6D3EpIJj_VLV6AA7_7Eda7lmPxWbno-GinyTH-8s8iTBl2Ci1lr7W4vT4LRYKY6tTlae8Pg6y6FK-hfpjxf8BKX3AuTWFEJZuqxed_F6fd-HcIRHEW7w9pvchbrzd-RqDRZROsgGEud3rgkoB-W21oKShXnNar5xtleSTyob5ylwhk',
  },
  {
    id: '3',
    name: 'Vision-4K Panel',
    price: 899,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjuspI_w6sjvLHOrZp19TrLXb0Pug6LE7pH3e1uGQU5kj72CkF9TqLk84pJV0dco-ftggTljaJIOBzOksMMomBWb1njAftLGIlMQq06G3sX-1A8FJ2K8Nc1mNWc7NAmJDirbjD3eSDRK8n4Y4vPO29a4NVMfFzewqOuSwxL0tFbwiupcMCwUyI5aSEsqKqjLoD2lI9ymxO_YzapZF_VsWBQYyTRFA3VwpeconKN25c97RAJZCwQX4hmyxRTyVl77sDqeLx4bhmKYU',
  },
]

const categories = [
  {
    title: 'Workspace',
    subtitle: 'Curated essentials',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByiShX0bTlM5iQlXhYPSUSlwaSfA6AwpaTv3ctQ0vvJ13idkDo78BNs3OyQLQm0-N4NXvGCerWdlt9IZk-BaRt6E3WkT3yn_0CD0XwDXHUvG_uzjDLCEh-K_jWl04__WLBiIl9_fg7icZOVjqWCBPub2z-Vjix5ZsqndTdLPBLDbouogO33NUEPAYom_hvJgmuHIe4tzIvHO5OmMd_usJDL2cxYkPIbyph27uQWLbXsy9PAYBUQ-iualKL018F_9pOV8vMvaf-R-c',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    title: 'Apparel',
    subtitle: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcRxP5PS25z-ghXKS0UST5MhxKy5Fn_6EJrYPzjdi-jiy0Z_GTLLfpbe8AJM4c95XpevA23QXU2GjOKLbRjQE6Ii9Vz7sJ1BFHdeBMn6pjG6oRUwoCmDdEzSURsXAo856IFlYVDPetPGz2XGLcGoJ3tvDM8Yc26x3rBsVj9Az8DHD9WdLU29A7lyE-zO4yjjZk5eYwNKHBHj032M5X57m3SZaNgcPP_EuZi4hUo6jhqwksvs_lk4Fs5Tb9o9q5yg4iz9qJmSb3cBA',
  },
  {
    title: 'IoT',
    subtitle: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOcdTsBL6Rmx8abvvgbpeoenOuWk_6rrWzU3_mkQfEnk0OrbyRf1fLU4wyZUqbtCgLmm4jf-Hu5n1RPg8_2stmGQv46YwQKhqU4sniOEEr8_ipRXuaZmWdMLBxIdmJGptNo9Zbbmj-WZU2rZj9-bjhEHOr1MHWZ69dbzpeg2JLjUiQH9rCCYqNOdZPYfvJNwLzoosBnwlvmlbVanTf55vqFzHLQzKsP4P1kWdKTlY6zma_BWa6K0dG-Mj7yhkOYGJIqMwiIW4aw10',
  },
  {
    title: 'Cases',
    subtitle: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcSwH1Q8XnWcRnWQ_RFOv2XUqp1Tir1reXXJEhMXaMpN866fZxjXdaE6VgHSBIZ4puoL3IddrsA82qyVgl0n5VYXrj83mlsP8VNss-MfKt5JXmB2OhxHmGodh_KDSC65KV00at8S2iFVYMKM9AM6KjKChEUyJ-kotn5_QNPInlaulnl0rUVN07yCaGWnIbbTw5ABc8EYVtApjTsGbW1yMIezIYxtuz_tgqNkNRNZF0XRpW4-c26QSAafeaFudIFmuYWC5WgunC0Hk',
  },
]

export default function HomePage() {
  const { getItemQuantity } = useCartStore()

  return (
    <StorefrontShell active="" showSearch={false} showMarket={false} showSupport>
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="text-5xl md:text-[60px] xl:text-[72px] font-extrabold tracking-tighter leading-[0.96] mb-8 max-w-[860px]">
                High-Performance
                <br />
                Infrastructure for the
                <br />
                Modern Creative.
              </h1>
              <p className="text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
                Engineered for precision. Built for speed. The Obsidian series represents the pinnacle of developer-grade hardware and software integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-zinc-200 transition-all duration-300 active:scale-95">
                  Shop the Series
                </Link>
                <a href="#about" className="bg-transparent text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition-all duration-300 active:scale-95">
                  About Us
                </a>
                <a href="#labs" className="bg-transparent text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 transition-all duration-300 active:scale-95">
                  Labs
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-low border border-white/5 group relative">
                <AdaptiveImage className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Workstation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGYNGaR1Z_KKD7UDXBW5M4TGw2jjMDN7dCbG_1mG6XH3FA9JkvfWZHKiPxqvIV6AxaVNtgzXtdV5lGNftQsDTKfnbLEF8NwtGGIhTQIPpXlp8JUs3wUP811WxWfmQ0ZR0vbwGpGtir7r3vbCqNUrjKQcRktnI4XHbPc44jPci3RTVgRSv1u-9nn8JyNkSpcfTGj8WnpiB-S-AuQM62SCaEePSfFdyDHGYFTHtzdzGovt4onakaU6wfRUW3z88xIdM0klZqJrsIwmc" fallbackLabel="Precision workstation" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="bg-white text-black px-3 py-1 text-xs font-mono font-bold tracking-widest rounded-full">NEW ARRIVAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
          <div className="w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_58%)] blur-3xl" />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#0e0e0e]">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Forge</h2>
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Hardware Catalog v2.4</p>
            </div>
            <Link to="/products" className="text-white hover:underline underline-offset-8 transition-all font-medium">Explore All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group bg-black border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:border-white/30">
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-surface-container mb-6">
                  <AdaptiveImage className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt={product.name} src={product.image} fallbackLabel={product.name} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1">{product.name}</h3>
                    <p className="text-zinc-500 text-sm font-mono">${product.price.toFixed(2)}</p>
                  </div>
                  <Link to="/products" className="p-2 bg-white/5 hover:bg-white text-white hover:text-black transition-colors rounded-lg">
                    <span className="material-symbols-outlined text-sm">arrow_outward</span>
                  </Link>
                </div>
                {getItemQuantity(product.id) > 0 ? <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.24em] text-zinc-500">Already added from marketplace</p> : <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.24em] text-zinc-600">Open the live marketplace to purchase</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-screen-2xl mx-auto px-6">
          <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-12">Browse by Ecosystem</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
            {categories.map((item) => (
              <div key={item.title} className={`${item.span || ''} relative group overflow-hidden rounded-xl border border-white/10`}>
                <AdaptiveImage className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" alt={item.title} src={item.image} fallbackLabel={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className={`${item.span ? 'text-3xl' : 'text-xl'} font-bold mb-2`}>{item.title}</h3>
                  {item.subtitle ? <p className="text-zinc-400 font-mono text-sm uppercase">{item.subtitle}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <span className="text-black/50 font-mono text-xs font-bold tracking-[0.3em] uppercase block mb-6">Limited Release</span>
              <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-none mb-8">
                THE OBSIDIAN
                <br />
                ULTIMATE BUNDLE.
              </h2>
              <p className="text-black/70 text-xl leading-relaxed mb-10">
                Get the complete ecosystem at a specialized founder&apos;s rate. For those who demand the absolute best in form and function.
              </p>
              <Link to="/products" className="bg-black text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all active:scale-95 inline-block">
                Claim Founder&apos;s Rate
              </Link>
            </div>
            <div className="relative z-10 w-full md:w-1/3">
              <div className="font-mono text-black text-[120px] font-black leading-none opacity-5 select-none absolute -right-20 -bottom-20 rotate-12">
                FORGE
              </div>
              <div className="border-l-4 border-black pl-8">
                <div className="mb-4">
                  <span className="text-black font-black text-4xl leading-none">20%</span>
                  <span className="text-black/60 font-mono text-sm ml-2">SAVINGS</span>
                </div>
                <p className="text-black/60 text-sm max-w-[200px]">
                  Valid for the first 500 orders of the Complete Forge series.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28" id="about">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">About Us</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Crafted with care, precision, and relentless innovation.</h2>
              <p className="text-zinc-400 text-lg leading-8 max-w-xl">
                Obsidian Forge is a premium commerce lab for high-performance hardware. We obsess over material quality, industrial design, calibration, and the way every product feels when it reaches your desk.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                ['Care', 'Every batch is inspected by hand, packaged with impact-safe materials, and verified against thermal and finish standards.'],
                ['Precision', 'Our product teams tune tolerances, responsiveness, and visual consistency so every item feels intentionally engineered.'],
                ['Innovation', 'We merge premium aesthetics with forward-looking compute, workflow, and lab-grade component thinking.'],
              ].map(([title, body]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 min-h-[240px]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">{title}</span>
                  <h3 className="text-2xl font-bold mt-5 mb-4">{title} first</h3>
                  <p className="text-zinc-400 leading-7">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#0e0e0e]" id="labs">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">Labs</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">How We Build the Forge.</h2>
            </div>
            <p className="text-zinc-400 max-w-2xl leading-8">
              From concept modeling to endurance testing, each product moves through a deliberate lab pipeline focused on durability, performance, and tactile satisfaction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              ['Concept', 'We model proportions, silhouettes, and use-cases around real creative workflows and desk setups.'],
              ['Materials', 'Metal finishes, thermal layers, surfaces, and packaging are tested to keep the product premium in hand.'],
              ['Calibration', 'Latency, acoustics, force curves, and tolerances are tuned until the experience feels exact.'],
              ['Validation', 'Units pass QC, endurance checks, and shipping stress validation before release to the storefront.'],
            ].map(([title, body], index) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-mono text-sm mb-6">{`0${index + 1}`}</div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-zinc-400 leading-7">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28" id="support">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">Support Community</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Built with customers, operators, and forge credits in the loop.</h2>
            </div>
            <p className="text-zinc-400 max-w-2xl leading-8">
              Obsidian Forge is backed by a support network that blends careful customer handling, software tools, and transparent credit to the people shaping the brand.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              ['Happy Forgers', '4.9 / 5 buyer satisfaction', 'Real buyers drive our roadmap with setup notes, review loops, and post-purchase feedback from premium desk builds.'],
              ['Forge Software', 'Companion tools + firmware', 'Our internal software stack keeps profiles, calibration presets, and future companion utilities aligned with each product line.'],
              ['Support Crew', 'Human-first service', 'Shipping help, setup guidance, and billing resolution are handled with the same care as the hardware itself.'],
              ['Credits', 'Architects, makers, partners', 'Industrial designers, QA leads, packaging specialists, and platform engineers all leave a visible mark on each release.'],
            ].map(([title, eyebrow, body]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 min-h-[260px] flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</p>
                <h3 className="text-2xl font-bold mt-5 mb-4">{title}</h3>
                <p className="text-zinc-400 leading-7 flex-1">{body}</p>
                <div className="pt-6 mt-6 border-t border-white/10">
                  <span className="text-sm text-white">Inside the forge ecosystem</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#0e0e0e]">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">Trusted by Architects</h2>
            <p className="text-4xl font-bold tracking-tight">Verified Operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[
              ['Marcus Chen', 'CTO @ Vercel Labs', "The Obsidian Forge isn't just hardware; it's a productivity enhancer. The tactile feedback and visual aesthetic are unmatched in the current market."],
              ['Sarah Jenkins', 'Design Systems Lead', 'Finally, a brand that understands the developer aesthetic. Clean lines, dark themes, and pure performance. Absolute precision.'],
              ['David Vo', 'Fullstack Architect', "Every piece feels intentional. The weight, the finish, and the software integration. It's the only setup I recommend to my team."],
              ['Anika Rao', 'Lead Systems Architect', 'The lab process shows in the final product. Thermal confidence, exact tolerances, and a premium identity all the way through.'],
            ].map(([name, role, quote]) => (
              <div key={name} className="space-y-6 rounded-2xl border border-white/10 bg-black p-6">
                <div className="text-primary text-6xl leading-none font-serif">&quot;</div>
                <p className="text-xl text-on-surface leading-relaxed italic">{quote}</p>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-zinc-500 text-sm font-mono uppercase tracking-tighter">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
