import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: number
  nombre: string
  email: string
  rol: "admin" | "cajero" | "contabilidad"
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

/**
 * Store de autenticación con Zustand
 * Persiste el estado en localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
