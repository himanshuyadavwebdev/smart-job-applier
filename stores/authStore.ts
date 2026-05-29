import { create } from "zustand"
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/lib/storage"

interface User {
  _id: string
  name: string
  email: string
  avatar?: string | null
  preferences?: Record<string, unknown>
}

interface AuthState {
  user: User | null
  token: string | null
  isHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  setAuth: (user, token) => {
    safeSetItem("token", token)
    set({ user, token, isHydrated: true })
  },
  logout: () => {
    safeRemoveItem("token")
    set({ user: null, token: null, isHydrated: true })
  },
  hydrate: () => {
    const token = safeGetItem("token")
    set({ token, isHydrated: true })
  },
}))
