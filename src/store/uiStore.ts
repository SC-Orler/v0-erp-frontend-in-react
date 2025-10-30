import { create } from "zustand"

interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
}

interface UIState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
}

/**
 * Store de UI para manejar toasts y sidebar
 */
export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 5000)
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
  sidebarOpen: true,
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },
}))
