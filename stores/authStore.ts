import { create } from "zustand"

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
  setAuth: (user: User, token: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
    set({ user, token })
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    set({ user: null, token: null })
  },
  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      set({ token })
    }
  },
}))
