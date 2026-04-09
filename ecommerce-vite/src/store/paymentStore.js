import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function maskCard(number) {
  const digits = String(number || '').replace(/\D/g, '')
  const last4 = digits.slice(-4) || '0000'
  return `Card ending ${last4}`
}

export const usePaymentStore = create(
  persist(
    (set, get) => ({
      methods: [
        { id: 'card-4242', type: 'card', label: 'Card ending 4242', brand: 'Visa', isDefault: true },
      ],

      addCard: (number, brand = 'Card') => {
        const id = `card-${Date.now()}`
        const nextMethod = { id, type: 'card', label: maskCard(number), brand, isDefault: get().methods.length === 0 }
        set({ methods: [...get().methods.map((item) => ({ ...item, isDefault: item.isDefault && !nextMethod.isDefault })), nextMethod] })
      },

      addWallet: (label) => {
        const id = `wallet-${Date.now()}`
        const nextMethod = { id, type: 'wallet', label, brand: 'Wallet', isDefault: get().methods.length === 0 }
        set({ methods: [...get().methods.map((item) => ({ ...item, isDefault: item.isDefault && !nextMethod.isDefault })), nextMethod] })
      },

      removeMethod: (id) => {
        const filtered = get().methods.filter((item) => item.id !== id)
        if (filtered.length && !filtered.some((item) => item.isDefault)) {
          filtered[0] = { ...filtered[0], isDefault: true }
        }
        set({ methods: filtered })
      },

      setDefaultMethod: (id) => {
        set({ methods: get().methods.map((item) => ({ ...item, isDefault: item.id === id })) })
      },

      get defaultMethod() {
        return get().methods.find((item) => item.isDefault) || null
      },
    }),
    { name: 'obsidian-payments' }
  )
)
