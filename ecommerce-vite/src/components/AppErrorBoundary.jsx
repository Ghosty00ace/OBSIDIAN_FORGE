import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong.' }
  }

  componentDidCatch(error) {
    console.error('AppErrorBoundary caught an error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
          <div className="max-w-xl w-full rounded-2xl border border-white/10 bg-[#0e0e0e] p-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Recovery Mode</p>
            <h1 className="text-4xl font-bold tracking-tight mb-4">This screen ran into a rendering issue.</h1>
            <p className="text-zinc-400 leading-7 mb-8">
              We stopped the crash so the app doesn&apos;t leave you on a blank screen. You can jump back into the storefront or dashboard below.
            </p>
            <p className="text-zinc-600 text-sm mb-8">{this.state.message}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/" className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-neutral-200">Go Home</Link>
              <Link to="/products" className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:border-white">Open Marketplace</Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
